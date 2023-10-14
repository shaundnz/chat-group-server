<div align="center">
<h3 align="center">Chat-App</h3>

  <p align="center">
    A full stack chat application to allow realtime communication between users with WebSockets.
    <br />
    <a href="https://chat-app.shaundnz.com/"><strong>View Demo</strong></a>
    <br />
    <br />
    <a href="https://github.com/shaundnz/chat-group-client">Client Repository</a>
    ·
    <a href="https://github.com/shaundnz/chat-group-server">Server Repository</a>
  </p>
</div>

## About The Project

A chat application built with SvelteKit and NestJS. WebSockets allow real time communication between users. This app is hosted on AWS, and both client and server repositories have github actions which deploys the app to AWS on pushes to the main branch.

<table>
  <tr>
    <td>Chat Page</td>
     <td>Login Page</td>
     <td>Sign Up Page</td>
  </tr>
  <tr>
    <td><img alt="Chat Page" src="https://i.imgur.com/rWJdu4E.png"></td>
    <td><img alt="Login Page" src="https://i.imgur.com/aHjmucd.png"></td>
    <td><img alt="Sign Up Page" src="https://i.imgur.com/YAEaf4t.png"></td>
  </tr>
 </table>

### Built With

- [![Svelte][Svelte.dev]][Svelte-url]
- [![NestJS][Nest.js]][Nest-url]
- [![Aws][Aws]][Aws-url]
- [![GitHubActions][Github-actions]][Github-actions-url]

## Architecture

![AWS architecture diagram for chat-app](https://i.imgur.com/KC1dLMX.png)

### Request Flow

1. Requests to `chat-app.shaundnz.com/*` are received by the cloudfront distribution
2. If the URL matches `chat-app.shaundnz.com/api/*`
   1. Forward the request to the application load balancer
   2. The matching rule forwards the request the target group registered with `api-service`
3. All other URLs are forwarded to the S3 bucket. The relative URL corresponds to the object path in the bucket.

## Deployment Pipelines

### Client

![Chat-app client deployment pipeline](https://i.imgur.com/xDlzL8G.png)

### Server

![Chat-app server deployment pipeline](https://i.imgur.com/pp6URDC.png)

## Additional Notes

### Motivations

This project was a chance to learn new frameworks and technologies that I haven't used before. For the frontend, coming from React, Svelte and SvelteKit was an interesting change of pace and a fun challenge to learn. The principles of building responsive applications remained the same, but I loved Svelte's focus on simple syntax and minimal boilerplate code.

Similarly, for the backend, I challenged myself to use NestJs for this app. The focus on dependency injection meant it felt similar to ASP.NET apps which I am already familiar with. This was also the first API I had built using WebSockets, instead of just the standard REST endpoints, I used Socket.io to integrate WebSockets into the API to connect to clients, and send and receive events.

I also wanted to take this project all the way to being hosted on the cloud and accessible to anybody, not just running locally. For this I used AWS and GitHub actions, over the course of this project I became very comfortable building CI/CD pipelines that take source code and deploys artifacts to the cloud.

### Contact Me

[Personal Website](https://shaundnz.com/)

[LinkedIn](https://www.linkedin.com/feed/)

[Svelte.dev]: https://img.shields.io/badge/Svelte-4A4A55?style=for-the-badge&logo=svelte&logoColor=FF3E00
[Svelte-url]: https://svelte.dev/
[Nest.js]: https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white
[Nest-url]: https://nextjs.org/
[Aws]: https://img.shields.io/badge/AWS-%23FF9900.svg?style=for-the-badge&logo=amazon-aws&logoColor=white
[Aws-url]: aws.amazon.com
[Github-actions]: https://img.shields.io/badge/github%20actions-%232671E5.svg?style=for-the-badge&logo=githubactions&logoColor=white
[Github-actions-url]: https://github.com/features/actions
