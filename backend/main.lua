local logger = require("logger")
local millennium = require("millennium")
local utils = require("utils")

local defaults = {
	action = "shutdown",
	armed = false,
	countdownSeconds = 30,
	onlyWhenInstalling = false,
	watchedApps = "[]",
	enabledActions = '["sleep","hibernate","lock","quitsteam"]',
}

-- Windows shell commands per action. Hibernate uses `shutdown /h`; if
-- hibernation is disabled on the machine Windows falls back to sleep, which is
-- the least-surprising behaviour. Which actions are OFFERED is now the user's
-- choice in the plugin settings, so no runtime availability probing (which
-- flashed console windows) happens anymore.
local commands = {
	shutdown = "shutdown /s /t 0",
	restart = "shutdown /r /t 0",
	hibernate = "shutdown /h",
	sleep = "rundll32.exe powrprof.dll,SetSuspendState 0,1,0",
	lock = "rundll32.exe user32.dll,LockWorkStation",
}

-- Called from the frontend once its countdown elapses without being cancelled.
-- Returns a short status string the frontend logs; the OS command itself is
-- fire-and-forget since the process is usually about to go away.
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
