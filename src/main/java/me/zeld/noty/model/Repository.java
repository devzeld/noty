package me.zeld.noty.model;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface Repository extends MongoRepository<NoteEntity, String> {


}
