FROM debian:latest
RUN apt-get update && apt-get install -y python3 pip
WORKDIR /app
COPY requirements.txt requirements.txt
RUN pip install -r requirements.txt
RUN apt-get install -y nodejs npm
RUN npm install -g @ionic/cli
COPY . .
CMD ["./run.sh"]
