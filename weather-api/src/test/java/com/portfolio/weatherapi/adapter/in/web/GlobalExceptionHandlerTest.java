package com.portfolio.weatherapi.adapter.in.web;

import com.portfolio.weatherapi.application.dto.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.reactive.function.client.WebClientRequestException;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.net.URI;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@DisplayName("GlobalExceptionHandler")
class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler handler;
    private HttpServletRequest request;

    @BeforeEach
    void setUp() {
        handler = new GlobalExceptionHandler();
        request = new MockHttpServletRequest("GET", "/api/v1/weather/current");
    }

    @Test
    @DisplayName("ConstraintViolationException deve retornar 400 com mensagem de violação")
    void shouldReturn400ForConstraintViolation() {
        ConstraintViolation<?> violation = mock(ConstraintViolation.class);
        when(violation.getPropertyPath()).thenReturn(mock(jakarta.validation.Path.class));
        when(violation.getMessage()).thenReturn("não pode ser vazio");

        ConstraintViolationException ex = new ConstraintViolationException(Set.of(violation));
        ResponseEntity<ErrorResponse> response = handler.handleConstraintViolation(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().status()).isEqualTo(400);
        assertThat(response.getBody().error()).isEqualTo("Validation Error");
    }

    @Test
    @DisplayName("MissingServletRequestParameterException deve retornar 400 com nome do parâmetro")
    void shouldReturn400ForMissingParam() {
        MissingServletRequestParameterException ex =
                new MissingServletRequestParameterException("city", "String");

        ResponseEntity<ErrorResponse> response = handler.handleMissingParam(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().message()).contains("city");
    }

    @Test
    @DisplayName("WebClientResponseException 404 deve retornar 404 City Not Found")
    void shouldReturn404ForWebClientNotFound() {
        WebClientResponseException ex = WebClientResponseException.create(
                404, "Not Found", null, null, null);

        ResponseEntity<ErrorResponse> response = handler.handleWebClientError(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().error()).isEqualTo("City Not Found");
    }

    @Test
    @DisplayName("WebClientResponseException 401 deve retornar 401 Unauthorized")
    void shouldReturn401ForWebClientUnauthorized() {
        WebClientResponseException ex = WebClientResponseException.create(
                401, "Unauthorized", null, null, null);

        ResponseEntity<ErrorResponse> response = handler.handleWebClientError(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().error()).isEqualTo("Unauthorized");
    }

    @Test
    @DisplayName("WebClientResponseException 500 deve retornar 502 Bad Gateway")
    void shouldReturn502ForWebClientServerError() {
        WebClientResponseException ex = WebClientResponseException.create(
                500, "Internal Server Error", null, null, null);

        ResponseEntity<ErrorResponse> response = handler.handleWebClientError(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_GATEWAY);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().status()).isEqualTo(502);
    }

    @Test
    @DisplayName("WebClientRequestException deve retornar 504 Gateway Timeout")
    void shouldReturn504ForWebClientRequestException() {
        WebClientRequestException ex = new WebClientRequestException(
                new RuntimeException("connection timeout"),
                org.springframework.http.HttpMethod.GET,
                URI.create("http://api.openweathermap.org"),
                null);

        ResponseEntity<ErrorResponse> response = handler.handleWebClientRequestError(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.GATEWAY_TIMEOUT);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().status()).isEqualTo(504);
    }

    @Test
    @DisplayName("IllegalArgumentException deve retornar 400 com a mensagem da exceção")
    void shouldReturn400ForIllegalArgument() {
        IllegalArgumentException ex = new IllegalArgumentException("Argumento inválido: days must be between 1 and 5");

        ResponseEntity<ErrorResponse> response = handler.handleIllegalArgument(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().message()).isEqualTo("Argumento inválido: days must be between 1 and 5");
    }

    @Test
    @DisplayName("Exception genérica deve retornar 500 Internal Server Error")
    void shouldReturn500ForGenericException() {
        Exception ex = new RuntimeException("erro inesperado");

        ResponseEntity<ErrorResponse> response = handler.handleGeneral(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().status()).isEqualTo(500);
        assertThat(response.getBody().error()).isEqualTo("Internal Server Error");
    }
}
