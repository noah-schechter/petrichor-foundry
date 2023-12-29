# Import libraries
from flask import Flask, render_template
from flask_socketio import SocketIO
import serial

import threading
import time
from datetime import datetime
from flask_cors import CORS 

import csv_logging

# Set up flask app
app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*", transport="websocket")
CORS(app)

# Globals 
start_timestamp = 0
logging = False 
power = 1
fan = 1
csv_name = ""

# Define the serial port and CSV file
try: 
    ser = serial.Serial('/dev/cu.usbmodem1201', 9600)  # /dev/ttys004 /dev/cu.usbmodem1201
except:
    ser = 0

# Function to read data from the serial port
def read_temp_data():
    while True:
        try: 
            # line =  ser.readline().decode('utf-8').strip()
            line = "1,2,3"
            if len(line.split(',')) >= 2:
               # temp_far = ser.readline().decode('utf-8').strip().split(',')[2]
                temp_far = 3
                global start_timestamp
                timestamp = int(time.time()) - start_timestamp # Current timestamp in milliseconds
                
                # Send data to client regardless of whether we've begun logging so that client can identify the start timestamp 
                socketio.emit('update_temp_data', {'logging': logging, 'timestamp': timestamp, 'data': temp_far})
                
                if logging:
                    global csv_name 
                    try: 
                        csv_logging.write({'Timestamp': timestamp, 'Event type': 'temp update', 'Power': power, 'Fan': fan, 'Temperature': temp_far}, csv_name)
                    except:
                        socketio.emit('failure_update', {'timestamp': timestamp, 'explanation': "Failed to read write data to CSV. Trying again in one second."})

        except:
            socketio.emit('failure_update', {'explanation': "Failed to read temperature. Trying again in one second."})
        time.sleep(1)


# Route for serving the HTML template
@app.route('/')
def index():
    return render_template('index.html')

@socketio.on("Start timestamp")
def handle_start_logging_message(message):
    # Debugging
    print('Received start timestamp:', message)

    # Set start_timestamp 
    global start_timestamp
    start_timestamp = message

    # Turn on logging 
    global logging 
    logging = True 

    # Init CSV logging system 
    global csv_name
    csv_name = 'roast_' + str(datetime.now().strftime('%Y-%m-%d %H:%M:%S')) + '.csv'
    csv_logging.init_csv(csv_name)


@socketio.on("Stop logging")
def handle_stop_logging_message(message):
    print('Received stop message')

    # Stop logging (or just keep logging false)
    global logging 
    logging = False


@socketio.on("Reset")
def handle_reset_logging_message(message):
    print('Received reset message')
    # Stop logging (or just keep logging false)
    global logging 
    logging = False

    # Reset start_timestamp
    global start_timestamp
    start_timestamp = 0


@socketio.on("Power update")
def handle_power_update(message):
    print('Recieved power update')
    global power 
    global logging

    # If it's a permisible change, make the change 
    if 0 < message and 10 > message:

        # Update power 
        power = message

         # Tell client we've recieved it so they can log it in telemetry and (possibly) graph it 
         # Fetch a timestamp 
        global start_timestamp
        timestamp = int(time.time()) - start_timestamp 
            
        # Send it to the client for graphing purposes 
        socketio.emit('update_power_data', {'logging': logging, 'timestamp': timestamp, 'power': power}) # We send this data back to the client even though it know the power because we want it to use the server's timestamp 
            

        if logging:
            
            # Log it
            global fan  
            global csv_name
            csv_logging.write({'Timestamp': timestamp, 'Event type': 'power update', 'Power': power, 'Fan': fan, 'Temperature': 0}, csv_name)
    else: 
        print("Power update out of bounds")


@socketio.on("Fan update")
def handle_fan_update(message):
    print('Recieved fan update')
    global fan 
    global logging

    # If it's a permissible change, make the change 
    if 0 < message and 10 > message:

        # Update fan 
        fan = message

        # Tell client we've recieved it so they can log it in telemetry and (possibly) graph it 
        global start_timestamp
        timestamp = int(time.time()) - start_timestamp 
        socketio.emit('update_fan_data', {'logging': logging, 'timestamp': timestamp, 'fan': fan}) # We send this data back to the client even though it know the power because we want it to use the server's timestamp 

        if logging:
        
            # Log it
            global power
            global csv_name 
            csv_logging.write({'Timestamp': timestamp, 'Event type': 'fan update', 'Power': power, 'Fan': fan, 'Temperature': 0}, csv_name)

    else: 
        print("Fan update out of bounds ")

# Event handler for client connection
@socketio.on('connect')
def handle_connect():
    print('Client connected')

if __name__ == '__main__':
    # Start the serial data reading thread
    serial_thread = threading.Thread(target=read_temp_data)
    serial_thread.daemon = True
    serial_thread.start()

    # Start the Flask-SocketIO server
    socketio.run(app, debug=True)