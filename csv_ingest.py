import csv

# Open CSV file for writing header
def init_csv(csv_name):
    with open(csv_name, 'w', newline='') as csvfile: 