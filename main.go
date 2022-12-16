package main

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"net/http/cookiejar"
	"net/url"
	"os"
	"strings"
	"time"
)

var (
	cookieJar, _ = cookiejar.New(nil)
	httpClient   = &http.Client{
		Timeout: time.Second * 3,
		Transport: &http.Transport{
			TLSHandshakeTimeout: 3 * time.Second,
		},
		Jar: cookieJar,
	}
)

// NumWorkers is set in the challenge script, max is 8 so do not increase it
const NumWorkers = 8

func main() {
	req, err := http.NewRequest(http.MethodGet, "https://www.hetzner.com", nil)
	setHeaders(req)
	if err != nil {
		log.Fatalf("error creating new request: %s", err)
	}

	res, err := httpClient.Do(req)
	if err != nil {
		panic(err)
	}
	defer res.Body.Close()

	// pre-calculated offset for secret data
	io.CopyN(io.Discard, res.Body, 16349)
	secret := make([]byte, 128)
	if n, err := res.Body.Read(secret); err != nil {
		log.Fatalf("failed to read secret, read %d bytes: %v", n, err)
	}
	// empty the body io.Reader so that the connection can be reused
	io.Copy(io.Discard, res.Body)

	// uncomment if not using pre-calculated offset
	// b, err := io.ReadAll(res.Body)
	// if err != nil {
	// 	panic(err)
	// }
	// idx := bytes.Index(b, []byte("ge(\"")) + 4
	// secret := b[idx : idx+128]

	log.Printf("secret is %s", secret)

	solutionChan := make(chan string, 1)
	cancelChan := make(chan struct{}, NumWorkers-1)

	start := time.Now()
	for i := 0; i < NumWorkers; i++ {
		go work(i, fmt.Sprintf("%s%s", secret, btoa(i)), solutionChan, cancelChan)
	}

	challenge := <-solutionChan
	log.Printf("found solution %s in %s", challenge, time.Since(start))

	for i := 0; i < len(cancelChan); i++ {
		cancelChan <- struct{}{}
	}

	{
		// submit and pipe the response to stdout
		params := url.Values{}
		params.Add("challenge", challenge)
		body := strings.NewReader(params.Encode())

		req, err := http.NewRequest("POST", "https://www.hetzner.com/_ray/pow", body)
		if err != nil {
			panic(err)
		}
		setHeaders(req)

		res, err := httpClient.Do(req)
		if err != nil {
			panic(err)
		}
		defer res.Body.Close()

		log.Printf("main page code:")
		io.Copy(os.Stdout, res.Body)
	}
}

func setHeaders(req *http.Request) {
	req.Header.Set("Authority", "www.hetzner.com")
	req.Header.Set("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9")
	req.Header.Set("Accept-Language", "en-US,en;q=0.9,ca;q=0.8,es;q=0.7")
	req.Header.Set("Cache-Control", "max-age=0")
	req.Header.Set("Dnt", "1")
	req.Header.Set("Referer", "https://www.hetzner.com/")
	req.Header.Set("Sec-Ch-Ua", "\"Not?A_Brand\";v=\"8\", \"Chromium\";v=\"108\", \"Google Chrome\";v=\"108\"")
	req.Header.Set("Sec-Ch-Ua-Mobile", "?0")
	req.Header.Set("Sec-Ch-Ua-Platform", "\"Windows\"")
	req.Header.Set("Sec-Fetch-Dest", "document")
	req.Header.Set("Sec-Fetch-Mode", "navigate")
	req.Header.Set("Sec-Fetch-Site", "same-origin")
	req.Header.Set("Sec-Fetch-User", "?1")
	req.Header.Set("Upgrade-Insecure-Requests", "1")
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36")
}
