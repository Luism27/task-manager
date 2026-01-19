# Technical Test - Task Manager

This project is a task management application consisting of a Django REST framework backend and an Angular frontend.

## Prerequisites

Before you begin, ensure you have the following installed:
- [Python 3.10+](https://www.python.org/downloads/)
- [Node.js (LTS version)](https://nodejs.org/)
- [pnpm](https://pnpm.io/installation) (recommended package manager for the frontend)

---

## Backend Setup (Django)

The backend is built with Django and Django REST Framework.

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Create a virtual environment (optional but recommended):**
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```

3.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Run migrations:**
    The project uses SQLite by default, so no database server setup is required.
    ```bash
    python manage.py migrate
    ```

5.  **(Optional) Create a superuser:**
    If you want to access the Django admin panel (`http://localhost:8000/admin/`).
    ```bash
    python manage.py createsuperuser
    ```

6.  **Run the development server:**
    ```bash
    python manage.py runserver
    ```
    The backend will be available at `http://localhost:8000`.

7.  **Run tests:**
    ```bash
    python manage.py test
    ```

---

## Frontend Setup (Angular)

The frontend is built with Angular.

1.  **Navigate to the frontend directory:**
    ```bash
    cd frontend
    ```

2.  **Install dependencies:**
    ```bash
    pnpm install
    ```

3.  **Environment Variables (Optional):**
    By default, the frontend connects to `http://localhost:8000`. If your backend is running on a different URL, you can set the `NG_APP_API_URL` environment variable.

4.  **Run the development server:**
    ```bash
    pnpm start
    ```
    The frontend will be available at `http://localhost:4200`.

4.  **Run tests:**
    ```bash
    pnpm test
    ```

---

## Project Structure

- `backend/`: Django project containing the REST API.
  - `tasks/`: Task management app (models, views, serializers).
  - `users/`: User management and authentication.
- `frontend/`: Angular application.
  - `src/app/components/`: UI components.
  - `src/app/services/`: Services for API interaction.
