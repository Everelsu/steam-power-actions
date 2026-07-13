local logger = require("logger")
local millennium = require("millennium")
local utils = require("utils")
local fs = require("fs")

-- Settings live here in Lua: defaults, the schema (which actions exist, the
-- countdown range) and validation. The frontend is a thin renderer that reads
-- the schema from get_settings_meta() and writes every change through
-- set_setting(), so all the rules are enforced in one place.

local base_actions = { "shutdown", "restart" }
local optional_actions = { "sleep", "hibernate", "lock", "quitsteam" }
local countdown = { min = 5, max = 120, step = 5, default = 30 }

local defaults = {
	action = "shutdown",
	armed = false,
	countdownSeconds = countdown.default,
	onlyWhenInstalling = false,
	watchedApps = "[]",
	enabledActions = '["sleep","hibernate","lock","quitsteam"]',
}

-- Windows shell commands per action. Hibernate uses `shutdown /h`; if
-- hibernation is disabled Windows falls back to sleep. Which actions are
-- OFFERED is the user's choice in settings, so nothing is probed at runtime.
local commands = {
	shutdown = "shutdown /s /t 0",
	restart = "shutdown /r /t 0",
	hibernate = "shutdown /h",
	sleep = "rundll32.exe powrprof.dll,SetSuspendState 0,1,0",
	lock = "rundll32.exe user32.dll,LockWorkStation",
}

local function contains(list, value)
	for _, item in ipairs(list) do
		if item == value then
			return true
		end
	end
	return false
end

local function is_valid_action(id)
	return contains(base_actions, id) or contains(optional_actions, id)
end

local function clamp_round(n, lo, hi, step)
	if n < lo then
		n = lo
	elseif n > hi then
		n = hi
	end
	n = math.floor((n / step) + 0.5) * step
	if n < lo then
		n = lo
	elseif n > hi then
		n = hi
	end
	return n
end

-- Minimal hand-rolled JSON for flat arrays (no cjson dependency — it crashes
-- the plugin on this Millennium build).
local function json_string_array(list)
	local parts = {}
	for _, value in ipairs(list) do
		parts[#parts + 1] = '"' .. value .. '"'
	end
	return "[" .. table.concat(parts, ",") .. "]"
end

local function json_number_array(list)
	local parts = {}
	for _, value in ipairs(list) do
		parts[#parts + 1] = tostring(value)
	end
	return "[" .. table.concat(parts, ",") .. "]"
end

local function extract_strings(str)
	local out = {}
	for token in string.gmatch(str or "", '"(.-)"') do
		out[#out + 1] = token
	end
	return out
end

local function extract_numbers(str)
	local out = {}
	for token in string.gmatch(str or "", "%-?%d+") do
		out[#out + 1] = tonumber(token)
	end
	return out
end

-- ---------------------------------------------------------------------------
-- App state via appmanifest_<appid>.acf, same technique as SteamShutdown
-- (https://github.com/akorb/SteamShutdown). The JS download-queue callback
-- (SteamClient.Downloads.RegisterForDownloadItems) can skip or delay events
-- for very short/small downloads, causing the frontend to miss completion.
-- The .acf file, on the other hand, is written by Steam synchronously on
-- every state change, so reading it directly is a race-free ground truth.

local library_paths_cache = nil

-- Library folders beyond the main Steam install (from libraryfolders.vdf).
-- Minimal parsing on purpose: we only need the quoted "path" values.
local function library_paths()
	if library_paths_cache then
		return library_paths_cache
	end

	local steam_path = millennium.steam_path()
	local paths = { fs.join(steam_path, "steamapps") }

	local vdf_path = fs.join(steam_path, "steamapps", "libraryfolders.vdf")
	if fs.exists(vdf_path) then
		local content = utils.read_file(vdf_path)
		if content then
			for raw_path in string.gmatch(content, '"path"%s+"([^"]+)"') do
				local unescaped = raw_path:gsub("\\\\", "\\")
				local lib = fs.join(unescaped, "steamapps")
				if fs.exists(lib) then
					paths[#paths + 1] = lib
				end
			end
		end
	end

	library_paths_cache = paths
	return paths
end

local function find_manifest_path(appid)
	for _, dir in ipairs(library_paths()) do
		local candidate = fs.join(dir, "appmanifest_" .. appid .. ".acf")
		if fs.exists(candidate) then
			return candidate
		end
	end
	return nil
end

-- Bit layout reverse-engineered by SteamShutdown from observed StateFlags values:
--   bit 1  -> a download is running
--   bit 6  -> the download is no longer running (overrides bit 1/10)
--   bit 9  -> download was stopped by the user (cancelled, don't wait for it)
--   bit 10 -> a DLC download is running
local function is_downloading_flags(flags)
	local function bit_set(n, pos)
		return math.floor(n / (2 ^ pos)) % 2 == 1
	end
	return (bit_set(flags, 1) or bit_set(flags, 10)) and not bit_set(flags, 9) and not bit_set(flags, 6)
end

-- Returns the StateFlags integer for appid, or -1 if no manifest was found
-- (not installed and not yet queued).
local function app_state_flags(appid)
	local path = find_manifest_path(appid)
	if not path then
		return -1
	end
	local content = utils.read_file(path)
	if not content then
		return -1
	end
	local flags = content:match('"StateFlags"%s+"(%-?%d+)"')
	if not flags then
		return -1
	end
	return tonumber(flags) or -1
end

-- Batched lookup for the frontend poller. `appids_json` is a flat JSON number
-- array. Returns "appid:flags" pairs joined by commas, e.g. "220:1026,440:70"
-- (raw StateFlags — the frontend interprets the bits itself).
function get_app_states(appids_json)
	local ids = extract_numbers(appids_json)
	local parts = {}
	for _, id in ipairs(ids) do
		parts[#parts + 1] = string.format("%d:%d", id, app_state_flags(id))
	end
	return table.concat(parts, ",")
end

-- Whole-library scan for "wait for whole queue" mode — mirrors SteamShutdown's
-- approach of watching every installed app's manifest rather than trusting a
-- live event feed. Returns every appid with a manifest, not just downloading
-- ones: the frontend needs to tell "stopped downloading because it finished"
-- (manifest still there) apart from "stopped downloading because the game got
-- uninstalled/removed" (manifest gone entirely) — a plain "is it downloading"
-- flag alone can't make that distinction. "appid:flags" pairs joined by commas.
function get_library_snapshot()
	local parts = {}
	for _, dir in ipairs(library_paths()) do
		local entries = fs.list(dir)
		if entries then
			for _, entry in ipairs(entries) do
				if entry.is_file and utils.startswith(entry.name, "appmanifest_") and utils.endswith(entry.name, ".acf") then
					local content = utils.read_file(entry.path)
					local flags_str = content and content:match('"StateFlags"%s+"(%-?%d+)"')
					local flags = flags_str and tonumber(flags_str)
					if flags then
						local appid = tonumber(entry.name:match("appmanifest_(%d+)%.acf"))
						if appid then
							parts[#parts + 1] = string.format("%d:%d", appid, flags)
						end
					end
				end
			end
		end
	end
	return table.concat(parts, ",")
end

-- Frontend reads the schema from here so ranges/action lists have one source.
function get_settings_meta()
	return string.format(
		'{"baseActions":%s,"optionalActions":%s,"countdown":{"min":%d,"max":%d,"step":%d}}',
		json_string_array(base_actions),
		json_string_array(optional_actions),
		countdown.min,
		countdown.max,
		countdown.step
	)
end

-- Single validated writer for every setting. Returns "ok" or an error tag.
function set_setting(key, value)
	if key == "countdownSeconds" then
		local n = tonumber(value) or countdown.default
		millennium.config.set(key, clamp_round(n, countdown.min, countdown.max, countdown.step))
	elseif key == "action" then
		if type(value) == "string" and is_valid_action(value) then
			millennium.config.set(key, value)
		else
			return "invalid-action"
		end
	elseif key == "armed" or key == "onlyWhenInstalling" then
		millennium.config.set(key, value == true or value == "true")
	elseif key == "enabledActions" then
		local filtered = {}
		for _, id in ipairs(extract_strings(value)) do
			if contains(optional_actions, id) and not contains(filtered, id) then
				filtered[#filtered + 1] = id
			end
		end
		millennium.config.set(key, json_string_array(filtered))
	elseif key == "watchedApps" then
		millennium.config.set(key, json_number_array(extract_numbers(value)))
	else
		return "unknown-key"
	end
	return "ok"
end

-- Called from the frontend once its countdown elapses without being cancelled.
function perform_power_action(action)
	local command = commands[action]
	if command == nil then
		logger:error("Unknown power action: " .. tostring(action))
		return "unknown-action"
	end

	logger:info("Performing power action '" .. action .. "': " .. command)
	utils.exec(command)
	return "ok"
end

-- Frontend diagnostics land in the plugin log so issues are debuggable
-- without opening devtools.
function log_debug(msg)
	logger:info("[debug] " .. tostring(msg))
	return "ok"
end

local function on_load()
	for key, value in pairs(defaults) do
		if millennium.config.get(key) == nil then
			millennium.config.set(key, value)
		end
	end

	-- Obsolete key from the old auto-detection; remove it if present.
	if millennium.config.get("availabilityCache") ~= nil then
		millennium.config.delete("availabilityCache")
	end

	logger:info("Power Actions loaded (Millennium " .. millennium.version() .. ")")
	millennium.ready()
end

local function on_unload()
	logger:info("Power Actions unloaded")
end

return {
	on_load = on_load,
	on_unload = on_unload,
}
