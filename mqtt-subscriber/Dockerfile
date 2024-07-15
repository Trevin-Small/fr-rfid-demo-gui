# Python container image
FROM python:3.9.19-slim

# Set working directory of container (location commands are run)
WORKDIR /app

# Copy requirements file to containr
COPY requirements.txt ./

RUN pip install -r requirements.txt

# Copy current directory contents into the container at /app
COPY . .

# Run app.py when the container launches
CMD ["python", "-u", "app.py"]
