from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth.models import User
from .models import Task

class TaskTests(APITestCase):
    def setUp(self):
        # Create a regular user
        self.user = User.objects.create_user(username='testuser', password='testpassword')
        # Create an admin user
        self.admin_user = User.objects.create_superuser(username='adminuser', password='adminpassword')
        
        # Create some tasks
        self.task1 = Task.objects.create(title='Task 1', description='Description 1', user=self.user)
        self.task2 = Task.objects.create(title='Task 2', description='Description 2', user=self.admin_user)
        
        self.list_url = reverse('task-list')
        self.my_tasks_url = reverse('task-my-tasks')
        self.by_user_url = reverse('task-by-user')

    def test_list_tasks_unauthenticated(self):
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_list_tasks_regular_user(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should only see their own task
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['title'], self.task1.title)

    def test_list_tasks_admin(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should see all tasks
        self.assertEqual(len(response.data), 2)

    def test_create_task_regular_user(self):
        self.client.force_authenticate(user=self.user)
        data = {'title': 'New Task', 'description': 'New Description'}
        response = self.client.post(self.list_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Task.objects.filter(user=self.user).count(), 2)
        # Verify it was auto-assigned to the user
        self.assertEqual(response.data['user'], self.user.id)

    def test_create_task_admin_assigning_user(self):
        self.client.force_authenticate(user=self.admin_user)
        data = {'title': 'Admin Task', 'description': 'Admin Description', 'user': self.user.id}
        response = self.client.post(self.list_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['user'], self.user.id)

    def test_update_task_owner(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('task-detail', kwargs={'pk': self.task1.id})
        data = {'title': 'Updated Task 1'}
        response = self.client.patch(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.task1.refresh_from_db()
        self.assertEqual(self.task1.title, 'Updated Task 1')

    def test_update_task_non_owner(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('task-detail', kwargs={'pk': self.task2.id})
        data = {'title': 'Illegal Update'}
        response = self.client.patch(url, data)
        # Should fail because task2 belongs to admin
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND) # ModelViewSet get_queryset filters first

    def test_update_task_admin(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('task-detail', kwargs={'pk': self.task1.id})
        data = {'title': 'Admin Update'}
        response = self.client.patch(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.task1.refresh_from_db()
        self.assertEqual(self.task1.title, 'Admin Update')

    def test_delete_task_owner(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('task-detail', kwargs={'pk': self.task1.id})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Task.objects.filter(id=self.task1.id).count(), 0)

    def test_my_tasks_action(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.my_tasks_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], self.task1.id)

    def test_by_user_action_admin(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(f"{self.by_user_url}?user_id={self.user.id}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], self.task1.id)

    def test_by_user_action_regular_user(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(f"{self.by_user_url}?user_id={self.admin_user.id}")
        # Regular users don't have access to by_user (IsAdmin permission)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
