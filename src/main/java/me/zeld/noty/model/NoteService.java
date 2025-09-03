package me.zeld.not.model;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NoteService {
    private final Repository repo;

    public NoteService(Repository repo) {
        this.repo = repo;
    }

    public List<NoteEntity> findAll() {
        return repo.findAll();
    }

    public NoteEntity findById(String id) {
        return repo.findById(id).orElse(null);
    }

    public NoteEntity save(NoteEntity note) {
        return repo.save(note);
    }

    public void delete(String id) {
        repo.deleteById(id);
    }
}
