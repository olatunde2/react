
from api import create_app
from config import config_dict

app = create_app(config_dict['dev'])

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
