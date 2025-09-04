package me.zeld.noty.model;


import lombok.*;
import org.springframework.data.annotation.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Data
@Document(collection = "notes")
public class NoteEntity {
    @Id
    private String id;
    private String title;
    private String content;
    @CreatedDate
    private LocalDateTime createdAt;
    @LastModifiedDate
    private LocalDateTime updatedAt;

}
