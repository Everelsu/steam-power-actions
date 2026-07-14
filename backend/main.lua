local logger = require("logger")
local millennium = require("millennium")
local utils = require("utils")

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
