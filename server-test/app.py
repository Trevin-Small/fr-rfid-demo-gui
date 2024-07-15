import requests
import  time

time.sleep(10);

url = 'http://http-server:8000/server-test';

response = requests.get(url);

print(response.status_code);
print(response.text);
