import os
import sys

APP_NAME = 'source-diffusion'

def get_user_data():
    if os.name == 'posix': # macOS or Linux
        if sys.platform == 'darwin': # macOS
            return os.path.join(os.environ['HOME'], 'Library', 'Application Support', APP_NAME)
        elif 'linux' in sys.platform: # Linux
            return os.path.join(os.environ['XDG_CONFIG_HOME'], APP_NAME) if os.environ.get('XDG_CONFIG_HOME') else os.path.join(os.environ['HOME'], '.config', APP_NAME)
    elif os.name == 'nt':  # Windows
        return os.path.join(os.environ['APPDATA'], APP_NAME)
    else:
        raise OSError("Unsupported operating system")
