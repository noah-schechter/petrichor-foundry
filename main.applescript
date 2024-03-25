-- Replace "http://127.0.0.1:5000" with the URL you want to open
set urlToOpen to "http://127.0.0.1:5000"

-- Start the Python script in the background using nohup
do shell script "cd /Users/noahschechter/Coffee && source env/bin/activate && nohup ./dist/main > /dev/null 2>&1 &"

-- Proceed to the next line without waiting for the shell command to finish
return "Shell command is running in the background."

-- Wait for the server to start (adjust the sleep duration as needed)
delay 1

-- Open the URL in the default web browser
open location urlToOpen

-- Check if the server is still running
set serverIsRunning to true
repeat while serverIsRunning
	try
		-- Attempt to fetch data from the server (replace with an appropriate test)
		set serverResponse to do shell script "curl -Is " & urlToOpen & " | head -n 1"
		
		-- If the server is still running, wait for a while before checking again
		delay 1
	on error
		-- If an error occurs, it means the server is not running
		set serverIsRunning to false
	end try
end repeat

-- Server has been closed, now interact with Google Chrome
tell application "Google Chrome"
	repeat with aWindow in every window
		repeat with aTab in every tab of aWindow
			if URL of aTab contains urlToOpen then
				close aTab
			end if
		end repeat
	end repeat
end tell