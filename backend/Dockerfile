# Use a slim, official Python 3.11 runtime as a parent image.
# Slim images are much smaller, which is better for building and downloading containers.
FROM python:3.11-slim

# Set environment variables.
# PYTHONDONTWRITEBYTECODE: Prevents Python from writing pyc files to disk (reduces size).
# PYTHONUNBUFFERED: Prevents Python from buffering stdout and stderr, so logs appear immediately.
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set the working directory inside the container to /app.
WORKDIR /app

# Install system dependencies.
# OpenCV (cv2) requires some system-level libraries (libgl1, libglib2.0-0) to process images correctly.
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy the requirements.txt file to the working directory.
COPY requirements.txt /app/

# Install the Python dependencies specified in requirements.txt.
# --no-cache-dir ensures pip doesn't save downloaded packages, keeping the image small.
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy the rest of your application code to the container's working directory.
COPY . /app/

# Create the uploads directory inside the container.
RUN mkdir -p uploads

# Expose port 8000 so that it can be accessed from outside the container.
EXPOSE 8000

# The command to run when the container starts.
# We use Uvicorn as our ASGI server to run the FastAPI application.
# 'main:app' tells it to look in main.py for an object named 'app'.
# --host 0.0.0.0 makes the server accessible on all network interfaces.
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
