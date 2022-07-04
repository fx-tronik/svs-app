#1st terminal (generujemy JSa dla UIa serwowanego przez django)
cd svs-app
pipenv shell
npm install
npm run dev

#2nd terminal (odpalamy właściwy serwer - django)
cd svs-app
pipenv shell
./django-install.sh
cd ./webapp
python manage.py makemigrations && python manage.py migrate && python manage.py loaddata rest
python manage.py runserver

#3rd terminal (serwer transkodujący strumień wideo)
cd svs-app/websocket
node websocket-relay.js

#4th terminal (podłączenie do jetsona, aby szedł strumień z kamery)
ssh nvidia@192.168.1.201
nvidia
cd workspace/rtsp server
python server.py
