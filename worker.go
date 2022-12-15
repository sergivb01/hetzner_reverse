package main

import (
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"fmt"
	"strconv"
	"strings"
)

func work(workerId int, secret string, solutionChan chan<- string, cancelChan <-chan struct{}) {
	var i int
	hash := sha256.New()
	for i = 0; ; i++ {
		select {
		// cancel if a solution was already found
		case <-cancelChan:
			return
		default:
		}

		formattedStr := []byte(fmt.Sprintf("%s%d", secret, i))
		hash.Write(formattedStr)

		if strings.HasPrefix(hex.EncodeToString(hash.Sum(nil)), "0020") {
			challange := fmt.Sprintf("%s%d", btoa(workerId), i)
			solutionChan <- challange
			return
		}
		hash.Reset()
	}
}

// btoa is the equivalent of btoa in JavaScript
func btoa(n int) string {
	return base64.StdEncoding.EncodeToString([]byte(strconv.Itoa(n)))
}
