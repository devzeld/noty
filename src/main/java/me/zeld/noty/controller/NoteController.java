package me.zeld.not.controller;


import me.zeld.not.model.NoteEntity;
import me.zeld.not.model.NoteService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notes")
public class NoteController {
    private final NoteService service;

    public NoteController(NoteService service) {
        this.service = service;
    }


    @GetMapping
    public List<NoteEntity> getAllNotes() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public NoteEntity getNoteById(@PathVariable String id) {
        return service.findById(id);
    }

    @PostMapping
    public NoteEntity createNote(@RequestBody NoteEntity note) {
        return service.save(note);
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
