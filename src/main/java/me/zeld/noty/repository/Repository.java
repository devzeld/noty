package me.zeld.noty.repository;

import me.zeld.noty.model.NoteEntity;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface Repository extends MongoRepository<NoteEntity, String> {


}
