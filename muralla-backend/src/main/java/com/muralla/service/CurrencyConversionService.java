package com.muralla.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.Map;

@Service
@Slf4j
public class CurrencyConversionService {

    private static final String EXCHANGE_API_URL = "https://api.exchangerate-api.com/v4/latest/USD";
    private static final String[] SUPPORTED_CURRENCIES = {"USD", "EUR", "GBP", "JPY", "CNY", "COP"};

    private Map<String, BigDecimal> exchangeRates = new HashMap<>();
    private long lastUpdateTime = 0;
    private static final long CACHE_DURATION_MS = 3600000; // 1 hour

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Converts amount from source currency to Colombian Pesos (COP)
     */
    public BigDecimal convertToCOP(BigDecimal amount, String sourceCurrency) {
        if (amount == null) {
            return null;
        }
        if ("COP".equals(sourceCurrency)) {
            return amount;
        }

        BigDecimal rate = getExchangeRate(sourceCurrency);
        return amount.multiply(rate).setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * Converts amount from Colombian Pesos (COP) to target currency
     */
    public BigDecimal convertFromCOP(BigDecimal amount, String targetCurrency) {
        if (amount == null) {
            return null;
        }
        if ("COP".equals(targetCurrency)) {
            return amount;
        }

        BigDecimal rate = getExchangeRate(targetCurrency);
        return amount.divide(rate, 2, RoundingMode.HALF_UP);
    }

    /**
     * Gets exchange rate for a currency (relative to COP)
     * The API returns rates relative to USD, so we need to calculate USD->COP first
     */
    private BigDecimal getExchangeRate(String currency) {
        updateExchangeRatesIfNeeded();

        BigDecimal usdToCopRate = exchangeRates.get("COP");
        BigDecimal usdToCurrencyRate = exchangeRates.get(currency);

        if (usdToCopRate == null || usdToCurrencyRate == null) {
            throw new IllegalArgumentException("Currency not supported: " + currency);
        }

        // Rate from currency to COP = (USD->COP) / (USD->currency)
        return usdToCopRate.divide(usdToCurrencyRate, 6, RoundingMode.HALF_UP);
    }

    /**
     * Updates exchange rates if cache is expired
     */
    private void updateExchangeRatesIfNeeded() {
        long currentTime = System.currentTimeMillis();
        if (currentTime - lastUpdateTime < CACHE_DURATION_MS && !exchangeRates.isEmpty()) {
            return;
        }

        try {
            ExchangeRateResponse response = restTemplate.getForObject(EXCHANGE_API_URL, ExchangeRateResponse.class);
            if (response != null && response.getRates() != null) {
                exchangeRates = new HashMap<>();
                for (String currency : SUPPORTED_CURRENCIES) {
                    BigDecimal rate = response.getRates().get(currency);
                    if (rate != null) {
                        exchangeRates.put(currency, rate);
                    }
                }
                lastUpdateTime = currentTime;
                log.info("Exchange rates updated successfully");
            }
        } catch (Exception e) {
            log.error("Failed to update exchange rates: {}", e.getMessage());
            if (exchangeRates.isEmpty()) {
                // Fallback rates if API fails
                exchangeRates.put("USD", BigDecimal.ONE);
                exchangeRates.put("EUR", new BigDecimal("0.85"));
                exchangeRates.put("GBP", new BigDecimal("0.74"));
                exchangeRates.put("JPY", new BigDecimal("159.43"));
                exchangeRates.put("CNY", new BigDecimal("6.84"));
                exchangeRates.put("COP", new BigDecimal("3646.11"));
                log.warn("Using fallback exchange rates");
            }
        }
    }

    /**
     * Returns the list of supported currencies
     */
    public String[] getSupportedCurrencies() {
        return SUPPORTED_CURRENCIES.clone();
    }

    /**
     * DTO for API response
     */
    private static class ExchangeRateResponse {
        private Map<String, BigDecimal> rates;

        public Map<String, BigDecimal> getRates() {
            return rates;
        }

        public void setRates(Map<String, BigDecimal> rates) {
            this.rates = rates;
        }
    }
}
