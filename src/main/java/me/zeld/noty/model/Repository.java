package me.zeld.not.model;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface Repository extends MongoRepository<NoteEntity, String> {


}
