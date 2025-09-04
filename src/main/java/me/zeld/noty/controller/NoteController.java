package me.zeld.noty.controller;


import lombok.extern.slf4j.Slf4j;
import me.zeld.noty.model.NoteEntity;
import me.zeld.noty.model.NoteService;
import org.bson.json.JsonObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notes")
@Slf4j
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
    public List<NoteEntity> getNoteByTitle(@RequestBody String title) {
        log.info("Collecting notes with title: {}", title);
        List<NoteEntity> noteList = service.findByTitle(title);
        log.debug("Founded notes that contains '{}': {}", title, noteList.size());
        return noteList;
    }

    @GetMapping("/id")
    public NoteEntity getNoteById(@RequestBody JsonObject id) {
        return service.findById(id.get());
    }

    @PostMapping
    public NoteEntity createNote(@RequestBody NoteEntity note) {
        log.info("Creating new note with title: {}", note.getTitle());
        NoteEntity savedNote = service.save(note);
        log.debug("Note created with ID: {}", savedNote.getId());
        return savedNote;
    }

    @PutMapping("/{id}")
    public NoteEntity updateNote(@PathVariable String id, @RequestBody NoteEntity newNote) {
        NoteEntity existing = service.findById(id);
        if (existing != null) {
            existing.setTitle(newNote.getTitle());
            existing.setContent(newNote.getContent());
            return service.save(existing);
        }
        return null;
    }

    @DeleteMapping("/{id}")
    public void deleteNote(@PathVariable String id) {
        service.delete(id);
    }
}
