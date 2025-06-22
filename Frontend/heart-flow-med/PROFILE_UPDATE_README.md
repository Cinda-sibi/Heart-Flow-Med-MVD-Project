# Profile Update Functionality

## Overview
The Profile page now includes comprehensive edit functionality that allows users to update their profile information based on their role in the system.

## Features

### Role-Based Profile Editing
- **Cardiologist**: Can update specialization, experience, consultation fees, availability, and availability status
- **Nurse**: Can update department and shift information
- **Sonographer**: Can update certification details
- **Administrative Staff**: Can update department, job title, working hours, shift, extension number, office location, and age
- **Patient**: Can update insurance provider, insurance ID, country, and age

### Common Fields (All Roles)
- First Name
- Last Name
- Phone Number
- Date of Birth
- Gender
- Address
- Emergency Contact

### User Interface Features
- **Edit Mode**: Click the "Edit" button to enter edit mode
- **Form Validation**: Required fields are marked with asterisks
- **Real-time Updates**: Form data is synchronized with the current profile
- **Success/Error Messages**: Clear feedback for successful updates and errors
- **Loading States**: Visual indicators during API calls
- **Cancel Functionality**: Ability to cancel edits and revert to original data

## API Integration

### Backend Endpoint
- **URL**: `/api/update-user-profile/`
- **Method**: PATCH
- **Authentication**: Required (JWT Token)

### Frontend API Service
- **File**: `src/apis/ProfileApis.jsx`
- **Function**: `updateUserProfile(profileData)`

## Usage

1. Navigate to the Profile page
2. Click the "Edit" button on any information card
3. Modify the desired fields
4. Click "Save Changes" to submit updates
5. Click "Cancel" to discard changes

## Technical Implementation

### Components
- **Profile.jsx**: Main profile component with edit functionality
- **FormField**: Reusable form field component
- **InfoCard**: Card wrapper for profile sections

### State Management
- **isEditing**: Controls edit mode
- **formData**: Stores form field values
- **isSubmitting**: Manages loading state
- **editError/editSuccess**: Handles user feedback

### Data Flow
1. Profile data is fetched on component mount
2. Form data is initialized with current profile values
3. User enters edit mode and modifies fields
4. Form data is sent to backend via API
5. Profile is refreshed with updated data
6. Success/error messages are displayed

## Error Handling
- Network errors are caught and displayed to user
- Form validation errors are shown inline
- Automatic error message clearing after 5 seconds
- Automatic success message clearing after 3 seconds

## Security
- All API calls require authentication
- Email field is read-only and cannot be modified
- Role-specific fields are only shown for appropriate roles
- Form data is validated both client-side and server-side 