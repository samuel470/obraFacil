package com.obrafacil.infrastructure.web;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {
  @ExceptionHandler(ResponseStatusException.class) public ResponseEntity<Map<String,String>> handle(ResponseStatusException e){ return ResponseEntity.status(e.getStatusCode()).body(Map.of("error",e.getReason())); }
  @ExceptionHandler(Exception.class) public ResponseEntity<Map<String,String>> any(Exception e){ return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error",e.getMessage())); }
}
