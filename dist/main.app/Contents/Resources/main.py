# Import libraries
from flask import Flask, render_template
from flask_socketio import SocketIO
import serial
import threading
import time
from datetime import datetime
from flask_cors import CORS 
import csv_logging
import random

# Set up flask app
app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*", transport="websocket", async_mode='threading')
CORS(app)

# Globals 
csv_name = ""


""" # Remvoe these when handling real data 
while True:
    try: 
        ser = serial.Serial('/dev/cu.usbmodem1201', 9600)  # /dev/ttys004 /dev/cu.usbmodem1201
        break
    except:
        print("Error connecting to serial port. Trying again in one second.")
        time.sleep(1)
""" 
    

"""
send_tick serves two purposes: 
1) Reading the temperature from the Arduino
2) Sending a timestamp tick to the client

The client handles all graphing and state storage. The server handles time and CSV logging. 
The main flow is server sends package containg a timestamp and a temp -> client handles these (displays them in some way) and sends back a package containing a complete summary of state -> server logs this state in the CSV
""" 
def send_tick():
    while True:
        # First, fetch temperature from the thermocouple
        try: 
            # line =  ser.readline().decode('utf-8').strip()
            # temp_far = ser.readline().decode('utf-8').strip().split(',')[2]
            temp_far = random.randint(230,250) # Take this out in prod 
        
        except:
            temp_far = "ERR"
        
        # Current timestamp in milliseconds
        timestamp = int(time.time())
                
        # Send data to client regardless of 1) whether we've begun so 
        socketio.emit('update_temp_data', {'timestamp': timestamp, 'data': temp_far})

        time.sleep(1)


# Route for serving the HTML template
@app.route('/')
def index():
    return render_template('index.html')

# Event handler for log data 
@socketio.on('log')
def handle_log_info(message):
    global csv_name
    if csv_name == "":
        csv_name = 'roast_' + str(datetime.now().strftime('%Y-%m-%d %H:%M:%S')) + '.csv'
        csv_logging.init_csv(csv_name)
    
    csv_logging.write(message, csv_name)

@socketio.on('New CSV')
def handle_reset(message):
    global csv_name
    csv_name = ""


# Event handler for CSV upload 
@socketio.on('upload')
def handle_upload(message):
    file_data = message['file']
    file_name = file_data['name']
    file_content = file_data['content']

    # Save file to the uploads folder 
    with open(f'uploads/{file_name}', 'w') as file:
        file.write(file_content)


    # Tell client we finished saving the file 
    socketio.emit('upload_response')

# Event handler for client connection
@socketio.on('connect')
def handle_connect():
    print('Client connected')

if __name__ == '__main__':
    # Start the serial data reading thread
    serial_thread = threading.Thread(target=send_tick)
    serial_thread.daemon = True
    serial_thread.start()

    # Start the Flask-SocketIO server
    socketio.run(app, debug=True)