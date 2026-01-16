#!/bin/bash

NAME="backend"                                  # Name of the application
DJANGODIR=/home/luism27/projects/task-manager/backend              # Django project root directory
SOCKFILE=/home/luism27/projects/task-manager/backend/run/gunicorn.sock  # Gunicorn socket path
LOGDIR=logs/                # Log directory
USER=luism27                                # The user to run as
GROUP=luism27                                     # The group to run as
NUM_WORKERS=3                                     # Number of worker processes (usually 2*CPU + 1)
DJANGO_WSGI_MODULE=backend.wsgi                 # WSGI module name

echo "Starting $NAME with Gunicorn"

# Create the run and log directories if they don't exist
RUNDIR=$(dirname $SOCKFILE)
test -d $RUNDIR || mkdir -p $RUNDIR
test -d $LOGDIR || mkdir -p $LOGDIR

# Activate the virtual environment
source venv/bin/activate
export PYTHONPATH=$DJANGODIR:$PYTHONPATH

# Start your Django Unicorn
exec /home/luism27/projects/task-manager/backend/venv/bin/gunicorn ${DJANGO_WSGI_MODULE}:application \
  --name $NAME \
  --workers $NUM_WORKERS \
  --user=$USER --group=$GROUP \
  --bind=unix:$SOCKFILE \
  --log-level=info \
  --log-file=$LOGDIR/$NAME.log \
  --error-logfile=$LOGDIR/$NAME-error.log
