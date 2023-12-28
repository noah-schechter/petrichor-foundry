import csv
import main

# Open CSV file for writing header
def init_csv(csv_name):
    with open(csv_name, 'w', newline='') as csvfile:
        csv_writer = csv.writer(csvfile)
        csv_writer.writerow(['Timestamp', 'Event type', 'Power', 'Fan', 'Temperature'])


# Function to save data to CSV file
def write(data, csv_name):
    with open(csv_name, 'a', newline='') as csvfile:
        csv_writer = csv.writer(csvfile)
        csv_writer.writerow([data['Timestamp'], data['Event type'], data['Power'], data['Fan'], data['Temperature']])
    