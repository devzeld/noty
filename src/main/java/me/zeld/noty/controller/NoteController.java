package me.zeld.noty.controller;

import me.zeld.noty.model.NoteEntity;
import me.zeld.noty.service.NoteService;
import me.zeld.noty.model.RequestEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notes")
public class NoteController {

    private static final Logger log = LoggerFactory.getLogger(NoteController.class);
    private final NoteService service;

    public NoteController(NoteService service) {
        this.service = service;
    }

    @GetMapping
    public List<NoteEntity> getAllNotes() {
        log.info("Collecting notes");
        List<NoteEntity> noteList = service.findAll();
        log.debug("Founded notes: {}", noteList.size());
        return noteList;
    }

    @GetMapping("/title")
    public List<NoteEntity> getNoteByTitle(@RequestBody RequestEntity requestEntity) {
        log.info("Collecting notes with title: {}", requestEntity.getTitle());
        List<NoteEntity> noteList = service.findByTitle(requestEntity.getTitle());
        log.debug("Founded notes that contains '{}': {}", requestEntity.getTitle(), noteList.size());
        return noteList;
    }

    @GetMapping("/id")
    public NoteEntity getNoteById(@RequestBody RequestEntity requestEntity) {
        return service.findById(requestEntity.getId());
    }

    @PostMapping
    public NoteEntity createNote(@RequestBody NoteEntity note) {
        log.info("Creating new note with title: {}", note.getTitle());
        NoteEntity savedNote = service.save(note);
        log.debug("Note created with ID: {}", savedNote.getId());
        return savedNote;
    }

    @PutMapping("/id")
    public NoteEntity updateNote(@RequestBody NoteEntity newNote) {
        NoteEntity existing = service.findById(newNote.getId());
        if (existing != null) {
            existing.setTitle(newNote.getTitle());
            existing.setContent(newNote.getContent());
            return service.save(existing);
        }
        return null;
    }

    @DeleteMapping("/id")
    public void deleteNote(@RequestBody RequestEntity requestEntity) {
        service.delete(requestEntity.getId());
    }
}
