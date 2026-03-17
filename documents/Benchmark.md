# 🚀 Benchmark-Protokoll: Microblog Arena


## 1. Test-Umgebung & Hardware

**Lokale Maschine (Host):**
* **Betriebssystem:** Windows 11 Pro
* **Prozessor (CPU):** Intel(R) Core(TM) i7-8850H CPU @ 2.60GHz (2.59 GHz)
* **Arbeitsspeicher (RAM):** 32.0 GB
* **Festplatte:** SSD (NVMe)

## Test-Szenarien (pgbench)

root@1a44c4fd5367:/# pgbench -U postgres -d test-postgres -i -s 100
dropping old tables...
creating tables...
generating data (client-side)...
10000000 of 10000000 tuples (100%) done (elapsed 17.24 s, remaining 0.00 s)
vacuuming...
creating primary keys...
done in 23.45 s (drop tables 0.38 s, create tables 0.01 s, client-side generate 17.47 s, vacuum 0.31 s, primary keys 5.28 s).
root@1a44c4fd5367:/# pgbench -U postgres -d test-postgres -i -s 1000
dropping old tables...
creating tables...
generating data (client-side)...
100000000 of 100000000 tuples (100%) done (elapsed 188.81 s, remaining 0.00 s)
vacuuming...
creating primary keys...
done in 281.78 s (drop tables 0.39 s, create tables 0.01 s, client-side generate 190.54 s, vacuum 0.49 s, primary keys 90.35 s).

## TPC-B

root@1a44c4fd5367:/# pgbench -c 50 -j 1 -t 10000 -U postgres test-postgres
pgbench (16.13 (Debian 16.13-1.pgdg13+1))
starting vacuum...end.
transaction type: <builtin: TPC-B (sort of)>
scaling factor: 1000
query mode: simple
number of clients: 50
number of threads: 1
maximum number of tries: 1
number of transactions per client: 10000
number of transactions actually processed: 500000/500000
number of failed transactions: 0 (0.000%)
latency average = 27.326 ms
initial connection time = 271.683 ms
tps = 1829.741915 (without initial connection time)



## Test-Szenarien (K6)

k6 run load-test.ts

         /\      Grafana   /‾‾/  
    /\  /  \     |\  __   /  /   
   /  \/    \    | |/ /  /   ‾‾\ 
  /          \   |   (  |  (‾)  |
 / __________ \  |_|\_\  \_____/ 


     execution: local
        script: load-test.ts
        output: -

     scenarios: (100.00%) 1 scenario, 1 max VUs, 10m30s max duration (incl. graceful stop):
              * default: 1 iterations for each of 1 VUs (maxDuration: 10m0s, gracefulStop: 30s)



  █ THRESHOLDS

    http_req_duration
    ✓ 'p(99)<1000' p(99)=25.33ms

    http_req_failed
    ✓ 'rate<0.01' rate=0.00%


  █ TOTAL RESULTS

    checks_total.......: 1       13.179954/s
    checks_succeeded...: 100.00% 1 out of 1
    checks_failed......: 0.00%   0 out of 1

    ✓ response code was 200

    HTTP
    http_req_duration..............: avg=25.33ms min=25.33ms med=25.33ms max=25.33ms p(90)=25.33ms p(95)=25.33ms
      { expected_response:true }...: avg=25.33ms min=25.33ms med=25.33ms max=25.33ms p(90)=25.33ms p(95)=25.33ms
    http_req_failed................: 0.00% 0 out of 1
    http_reqs......................: 1     13.179954/s

    EXECUTION
    iteration_duration.............: avg=75.87ms min=75.87ms med=75.87ms max=75.87ms p(90)=75.87ms p(95)=75.87ms
    iterations.....................: 1     13.179954/s

    NETWORK
    data_received..................: 853 B 11 kB/s
    data_sent......................: 77 B  1.0 kB/s




running (00m00.1s), 0/1 VUs, 1 complete and 0 interrupted iterations
default ✓ [======================================] 1 VUs  00m00.1s/10m0s  1/1 iters, 1 per VU

## K6 - zweiter Test

k6 run --vus 10 --iterations 100000 load-test.ts

         /\      Grafana   /‾‾/  
    /\  /  \     |\  __   /  /   
   /  \/    \    | |/ /  /   ‾‾\ 
  /          \   |   (  |  (‾)  |
 / __________ \  |_|\_\  \_____/ 


     execution: local
        script: load-test.ts
        output: -

     scenarios: (100.00%) 1 scenario, 10 max VUs, 10m30s max duration (incl. graceful stop):
              * default: 100000 iterations shared among 10 VUs (maxDuration: 10m0s, gracefulStop: 30s)



  █ THRESHOLDS

    http_req_duration
    ✓ 'p(99)<1000' p(99)=17.56ms

    http_req_failed
    ✓ 'rate<0.01' rate=0.00%


  █ TOTAL RESULTS

    checks_total.......: 100000  1734.66156/s
    checks_succeeded...: 100.00% 100000 out of 100000
    checks_failed......: 0.00%   0 out of 100000

    ✓ response code was 200

    HTTP
    http_req_duration..............: avg=5.39ms min=0s      med=4.64ms max=328.22ms p(90)=8.44ms p(95)=10.33ms
      { expected_response:true }...: avg=5.39ms min=0s      med=4.64ms max=328.22ms p(90)=8.44ms p(95)=10.33ms
    http_req_failed................: 0.00%  0 out of 100000
    http_reqs......................: 100000 1734.66156/s

    EXECUTION
    iteration_duration.............: avg=5.72ms min=752.4µs med=4.93ms max=329.24ms p(90)=8.85ms p(95)=10.8ms
    iterations.....................: 100000 1734.66156/s
    vus............................: 10     min=10          max=10
    vus_max........................: 10     min=10          max=10

    NETWORK
    data_received..................: 85 MB  1.5 MB/s
    data_sent......................: 7.7 MB 134 kB/s



                                                                                                                                                                                                                               
running (00m57.6s), 00/10 VUs, 100000 complete and 0 interrupted iterations                                                                                                                                                    
default ✓ [======================================] 10 VUs  00m57.6s/10m0s  100000/100000 shared iters    


## K6 dritter Test - ohne Cache

k6 run --vus 10 --iterations 100000 load-test.ts

         /\      Grafana   /‾‾/  
    /\  /  \     |\  __   /  /   
   /  \/    \    | |/ /  /   ‾‾\ 
  /          \   |   (  |  (‾)  |
 / __________ \  |_|\_\  \_____/ 


     execution: local
        script: load-test.ts
        output: -

     scenarios: (100.00%) 1 scenario, 10 max VUs, 10m30s max duration (incl. graceful stop):
              * default: 100000 iterations shared among 10 VUs (maxDuration: 10m0s, gracefulStop: 30s)



  █ THRESHOLDS

    http_req_duration
    ✓ 'p(99)<1000' p(99)=4.44ms

    http_req_failed
    ✓ 'rate<0.01' rate=0.00%


  █ TOTAL RESULTS

    checks_total.......: 100000  4898.893549/s
    checks_succeeded...: 100.00% 100000 out of 100000
    checks_failed......: 0.00%   0 out of 100000

    ✓ response code was 200

    HTTP
    http_req_duration..............: avg=1.89ms min=0s med=1.7ms  max=15.08ms p(90)=2.75ms p(95)=3.21ms
      { expected_response:true }...: avg=1.89ms min=0s med=1.7ms  max=15.08ms p(90)=2.75ms p(95)=3.21ms
    http_req_failed................: 0.00%  0 out of 100000
    http_reqs......................: 100000 4898.893549/s

    EXECUTION
    iteration_duration.............: avg=2.02ms min=0s med=1.83ms max=32.18ms p(90)=2.86ms p(95)=3.32ms
    iterations.....................: 100000 4898.893549/s
    vus............................: 10     min=10          max=10
    vus_max........................: 10     min=10          max=10

    NETWORK
    data_received..................: 85 MB  4.2 MB/s
    data_sent......................: 7.7 MB 377 kB/s



                                                                                                                                                                                                                               
running (00m20.4s), 00/10 VUs, 100000 complete and 0 interrupted iterations                                                                                                                                                    
default ✓ [======================================] 10 VUs  00m20.4s/10m0s  100000/100000 shared iters          


## Stress Test

█ THRESHOLDS

    http_req_duration
    ✓ 'p(99)<1000' p(99)=355.6ms

    http_req_failed
    ✗ 'rate<0.01' rate=1.08%


  █ TOTAL RESULTS

    checks_total.......: 1065579 5061.02233/s
    checks_succeeded...: 98.97%  1054661 out of 1065579
    checks_failed......: 1.02%   10918 out of 1065579

    ✗ response code was 200
      ↳  98% — ✓ 1054661 / ✗ 10918

    HTTP
    http_req_duration..............: avg=466.48ms min=0s       med=160.37ms max=1m2s p(90)=218.25ms p(95)=239.05ms
      { expected_response:true }...: avg=191.33ms min=0s       med=160.39ms max=1m0s p(90)=217.07ms p(95)=236.26ms
    http_req_failed................: 1.08%   11535 out of 1066196
    http_reqs......................: 1066196 5063.952803/s

    EXECUTION
    iteration_duration.............: avg=470.28ms min=505.49µs med=161.17ms max=1m2s p(90)=219.84ms p(95)=242.25ms
    iterations.....................: 1065579 5061.02233/s
    vus............................: 13662   min=0                max=13662
    vus_max........................: 20000   min=12951            max=20000

    NETWORK
    data_received..................: 900 MB  4.3 MB/s
    data_sent......................: 83 MB   392 kB/s



                                                                                                                                                                                                                               
running (3m31.0s), 00000/20000 VUs, 1065579 complete and 13690 interrupted iterations                                                                                                                                          
breaking ✗ [================================>-----] 13509/20000 VUs  3m28.5s/4m00.0s                                                                                                                                           
ERRO[0212] thresholds on metrics 'http_req_failed' were crossed; at least one has abortOnFail enabled, stopping test prematurely


## Stress Test mit Rate-Limiter


         /\      Grafana   /‾‾/  
    /\  /  \     |\  __   /  /   
   /  \/    \    | |/ /  /   ‾‾\ 
  /          \   |   (  |  (‾)  |
 / __________ \  |_|\_\  \_____/ 


     execution: local
        script: stress-test.ts
        output: -

     scenarios: (100.00%) 1 scenario, 2000 max VUs, 4m30s max duration (incl. graceful stop):
              * breaking: Up to 2000 looping VUs for 4m0s over 8 stages (gracefulRampDown: 30s, gracefulStop: 30s)



  █ THRESHOLDS

    http_req_duration
    ✓ 'p(99)<1000' p(99)=234.48ms

    http_req_failed
    ✓ 'rate<0.01' rate=0.00%


  █ TOTAL RESULTS

    checks_total.......: 1301929 5082.872497/s
    checks_succeeded...: 100.00% 1301929 out of 1301929
    checks_failed......: 0.00%   0 out of 1301929

    ✓ response code was 200

    HTTP
    http_req_duration..............: avg=105.76ms min=0s med=63.46ms max=37.23s p(90)=177.72ms p(95)=196.97ms
      { expected_response:true }...: avg=105.76ms min=0s med=63.46ms max=37.23s p(90)=177.72ms p(95)=196.97ms
    http_req_failed................: 0.00%   0 out of 1301929
    http_reqs......................: 1301929 5082.872497/s

    EXECUTION
    iteration_duration.............: avg=105.89ms min=0s med=63.58ms max=37.23s p(90)=177.83ms p(95)=197.12ms
    iterations.....................: 1301929 5082.872497/s
    vus............................: 7       min=1            max=1996
    vus_max........................: 2000    min=2000         max=2000

    NETWORK
    data_received..................: 1.1 GB  4.3 MB/s
    data_sent......................: 100 MB  392 kB/s



                                                                                                                                                                                                                                                                                                                           
running (4m16.1s), 0000/2000 VUs, 1301929 complete and 0 interrupted iterations                                                                                                                                                                                                                                            
breaking ✓ [======================================] 0000/2000 VUs  4m0s
