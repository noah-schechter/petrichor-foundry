from setuptools import setup

APP = ['main.py']
DATA_FILES = []
OPTIONS = {
    'argv_emulation': True,
    'packages': [
        'flask', 'flask_socketio', 'serial', 'threading', 'time', 'datetime', 
        'flask_cors', 'csv_logging', 'random'
    ],
}

setup(
    app=APP,
    data_files=DATA_FILES,
    options={'py2app': OPTIONS},
    setup_requires=['py2app'],
)
