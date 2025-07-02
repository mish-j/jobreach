import { tokenUtils } from './api';

export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000/api/accounts';

class FileService {
    async uploadResume(file) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_BASE_URL}/upload/resume/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${tokenUtils.getAccessToken()}`
            },
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to upload resume');
        }

        return await response.json();
    }

    async uploadCsv(file) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_BASE_URL}/upload/csv/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${tokenUtils.getAccessToken()}`
            },
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to upload CSV');
        }

        return await response.json();
    }

    async getResumes() {
        const response = await fetch(`${API_BASE_URL}/upload/resume/`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${tokenUtils.getAccessToken()}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch resumes');
        }

        return await response.json();
    }

    async getCsvFiles() {
        const response = await fetch(`${API_BASE_URL}/upload/csv/`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${tokenUtils.getAccessToken()}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch CSV files');
        }

        return await response.json();
    }

    async deleteResume(id) {
        const response = await fetch(`${API_BASE_URL}/upload/resume/${id}/`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${tokenUtils.getAccessToken()}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to delete resume');
        }

        return true;
    }

    async deleteCsv(id) {
        const response = await fetch(`${API_BASE_URL}/upload/csv/${id}/`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${tokenUtils.getAccessToken()}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to delete CSV file');
        }

        return true;
    }
}

export const fileService = new FileService();
