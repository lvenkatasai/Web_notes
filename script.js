document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const addNoteBtn = document.getElementById('addNoteBtn');
    const noteModal = document.getElementById('noteModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const noteForm = document.getElementById('noteForm');
    const notesContainer = document.getElementById('notesContainer');
    const emptyState = document.getElementById('emptyState');
    const searchInput = document.getElementById('searchInput');
    const exportBtn = document.getElementById('exportNotesBtn');
    const importBtn = document.getElementById('importNotesBtn');
    const fileInput = document.getElementById('fileInput');
    const clearAllBtn = document.getElementById('clearAllBtn');
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notificationText');
    const modalTitle = document.getElementById('modalTitle');

    // Color picker
    const colorOptions = document.querySelectorAll('.color-option');
    let selectedColor = 'purple';

    // State
    let notes = [];
    let currentEditId = null;

    // Initialize
    function init() {
        loadNotes();
        renderNotes();
        handleColorSelection();
    }

    // Show notification
    function showNotification(message, type = 'success') {
        notification.className = `notification ${type}`;
        notificationText.textContent = message;
        
        const icon = notification.querySelector('i');
        if (type === 'success') {
            icon.className = 'fas fa-check-circle';
        } else if (type === 'error') {
            icon.className = 'fas fa-exclamation-circle';
        } else if (type === 'info') {
            icon.className = 'fas fa-info-circle';
        }
        
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    // Load notes from localStorage
    function loadNotes() {
        const savedNotes = localStorage.getItem('notes');
        if (savedNotes) {
            try {
                notes = JSON.parse(savedNotes);
                if (!Array.isArray(notes)) {
                    notes = [];
                }
            } catch (error) {
                console.error('Error parsing notes:', error);
                notes = [];
            }
        }
    }

    // Save notes to localStorage
    function saveNotes() {
        localStorage.setItem('notes', JSON.stringify(notes));
    }

    // Render notes
    function renderNotes(searchTerm = '') {
        notesContainer.innerHTML = '';
        
        let filteredNotes = notes;
        if (searchTerm) {
            filteredNotes = notes.filter(note => 
                note.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }
        
        if (filteredNotes.length === 0) {
            emptyState.style.display = searchTerm ? 'none' : 'block';
            return;
        } else {
            emptyState.style.display = 'none';
        }
        
        filteredNotes.forEach(note => {
            const noteElement = createNoteElement(note);
            notesContainer.appendChild(noteElement);
        });
        
        // Add staggered animation
        const noteElements = notesContainer.querySelectorAll('.note-card');
        noteElements.forEach((el, index) => {
            el.style.animationDelay = `${index * 0.05}s`;
        });
    }

    // Create note element
    function createNoteElement(note) {
        const noteCard = document.createElement('div');
        noteCard.className = `note-card note-${note.color}`;
        
        const formatDate = new Date(note.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        noteCard.innerHTML = `
            <div class="note-header">
                <h3 class="note-title">${escapeHtml(note.title)}</h3>
                <div class="note-actions">
                    <button class="note-action-btn edit-note" data-id="${note.id}" data-tooltip="Edit Note">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="note-action-btn delete-note" data-id="${note.id}" data-tooltip="Delete Note">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="note-content">${escapeHtml(note.content)}</div>
            <div class="note-footer">
                <div class="note-tags">
                    ${note.tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
                </div>
                <span class="note-date">${formatDate}</span>
            </div>
        `;
        
        return noteCard;
    }

    // Escape HTML to prevent XSS
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Handle color selection
    function handleColorSelection() {
        colorOptions.forEach(option => {
            option.addEventListener('click', () => {
                colorOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                selectedColor = option.dataset.color;
            });
        });
    }

    // Generate unique ID
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Add or update note
    function addOrUpdateNote(noteData) {
        if (currentEditId) {
            // Update existing note
            const index = notes.findIndex(note => note.id === currentEditId);
            if (index !== -1) {
                notes[index] = { ...noteData, id: currentEditId };
                showNotification('Note updated successfully!');
            }
            currentEditId = null;
        } else {
            // Add new note
            notes.unshift(noteData);
            showNotification('Note added successfully!');
        }
        
        saveNotes();
        renderNotes();
        closeModal();
    }

    // Delete note
    function deleteNote(id) {
        notes = notes.filter(note => note.id !== id);
        saveNotes();
        renderNotes();
        showNotification('Note deleted successfully!', 'info');
    }

    // Get note by ID
    function getNoteById(id) {
        return notes.find(note => note.id === id);
    }

    // Open modal to add note
    function openModal() {
        currentEditId = null;
        modalTitle.textContent = 'Add New Note';
        noteForm.reset();
        colorOptions.forEach(opt => opt.classList.remove('active'));
        colorOptions[0].classList.add('active');
        selectedColor = 'purple';
        noteModal.classList.add('active');
    }

    // Open modal to edit note
    function openEditModal(id) {
        const note = getNoteById(id);
        if (!note) return;
        
        currentEditId = id;
        modalTitle.textContent = 'Edit Note';
        document.getElementById('noteTitle').value = note.title;
        document.getElementById('noteContent').value = note.content;
        document.getElementById('noteTags').value = note.tags.join(', ');
        
        colorOptions.forEach(opt => opt.classList.remove('active'));
        const colorOption = document.querySelector(`.color-option[data-color="${note.color}"]`);
        if (colorOption) {
            colorOption.classList.add('active');
            selectedColor = note.color;
        }
        
        noteModal.classList.add('active');
    }

    // Close modal
    function closeModal() {
        noteModal.classList.remove('active');
        currentEditId = null;
        noteForm.reset();
    }

    // Clear all notes
    function clearAllNotes() {
        if (notes.length === 0) {
            showNotification('No notes to clear', 'info');
            return;
        }
        
        if (confirm('Are you sure you want to delete all notes? This action cannot be undone.')) {
            notes = [];
            saveNotes();
            renderNotes();
            showNotification('All notes deleted successfully!', 'info');
        }
    }

    // Export notes as JSON
    function exportNotes() {
        if (notes.length === 0) {
            showNotification('No notes to export', 'info');
            return;
        }
        
        const dataStr = JSON.stringify(notes, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `notes-${new Date().toISOString().substring(0, 10)}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        showNotification('Notes exported successfully!', 'success');
    }

    // Handle file import
    function handleFileImport(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const importedNotes = JSON.parse(e.target.result);
                if (!Array.isArray(importedNotes)) {
                    throw new Error('Invalid file format');
                }
                
                // Import notes, avoiding duplicates
                const existingIds = new Set(notes.map(note => note.id));
                const newNotes = importedNotes.filter(note => !existingIds.has(note.id));
                
                if (newNotes.length > 0) {
                    notes.unshift(...newNotes);
                    saveNotes();
                    renderNotes();
                    showNotification(`${newNotes.length} notes imported successfully!`, 'success');
                } else {
                    showNotification('No new notes to import', 'info');
                }
            } catch (error) {
                showNotification('Error importing notes. Please check the file.', 'error');
                console.error('Import error:', error);
            }
        };
        
        reader.readAsText(file);
        event.target.value = ''; // Reset file input
    }

    // Event Listeners - Using direct event listeners for static elements
    addNoteBtn.addEventListener('click', openModal);
    closeModalBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    
    noteForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const title = document.getElementById('noteTitle').value.trim();
        const content = document.getElementById('noteContent').value.trim();
        const tagsInput = document.getElementById('noteTags').value.trim();
        const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()) : [];
        
        if (!title || !content) {
            showNotification('Title and content are required', 'error');
            return;
        }
        
        const noteData = {
            id: currentEditId || generateId(),
            title,
            content,
            color: selectedColor,
            tags,
            createdAt: new Date().toISOString()
        };
        
        addOrUpdateNote(noteData);
    });

    // Note actions - Using event delegation
    notesContainer.addEventListener('click', (e) => {
        const editBtn = e.target.closest('.edit-note');
        const deleteBtn = e.target.closest('.delete-note');
        
        if (editBtn) {
            e.preventDefault();
            const id = editBtn.dataset.id;
            openEditModal(id);
        }
        
        if (deleteBtn) {
            e.preventDefault();
            const id = deleteBtn.dataset.id;
            if (confirm('Are you sure you want to delete this note?')) {
                deleteNote(id);
            }
        }
    });

    // Search functionality
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            renderNotes(e.target.value);
        }, 300);
    });

    // Export notes
    exportBtn.addEventListener('click', exportNotes);
    
    // Import notes
    importBtn.addEventListener('click', () => {
        fileInput.click();
    });
    
    fileInput.addEventListener('change', handleFileImport);
    
    // Clear all notes
    clearAllBtn.addEventListener('click', clearAllNotes);
    
    // Close modal on outside click
    noteModal.addEventListener('click', (e) => {
        if (e.target === noteModal) {
            closeModal();
        }
    });

    // Initialize the app
    init();
});
