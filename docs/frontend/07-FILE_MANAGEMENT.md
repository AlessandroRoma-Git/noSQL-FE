
# 7. File Management

The application includes a dedicated section for file management, allowing users to upload and manage files that can be used throughout the system (e.g., as email attachments).

## 7.1. Core Components

- **`FileService`**: A service that handles all interactions with the `/api/v1/files` backend endpoint.
- **`FileListComponent`**: The main component for the "Files" section.

## 7.2. Functionality

### Uploading Files

- The `FileListComponent` provides an "Upload File" button.
- When a file is selected, the `FileService.uploadFile()` method sends it to the backend as `multipart/form-data`.
- The service uses Angular's `reportProgress: true` option to get live updates on the upload progress.
- The UI displays a progress bar that updates in real-time.
- Upon successful upload, a confirmation message is shown with the filename and the new file ID.

### Listing and Deleting Files

- **Listing**: The backend currently **does not provide an endpoint** to list all uploaded files (`GET /api/v1/files`). Because of this, the `FileService.loadFiles()` method is commented out and returns an empty array to prevent errors. The UI has been simplified to focus only on the upload functionality.
- **Deleting**: The UI provides a "Delete" button next to each file (in the commented-out list). The `FileService.deleteFile(id)` method calls the `DELETE /api/v1/files/{id}` endpoint. This functionality is ready but currently not exposed in the UI due to the lack of a file list.

This section is designed to be easily expandable. Once the backend implements the file listing endpoint, the `FileService` can be updated, and the data grid in `FileListComponent` can be re-enabled to provide a complete file management interface.
