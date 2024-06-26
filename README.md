# ai-model-orchestrator

**English** | [繁體中文](./README.zh-TW.md)

The project only uses DICOMweb to implement the Task Performer role in the [AIW-I](https://www.ihe.net/uploadedFiles/Documents/Radiology/IHE_RAD_Suppl_AIW-I.pdf) profile of IHE.

## Architecture Diagram
### IHE Profile AIW-I Actor Diagram
![IHE Profile AIW-I Actor Diagram](./docs/AIW-I-Actor-Diagram.drawio.png)

### Workflow Diagram
![Workflow Diagram](./docs/AIW-I-Workflow.drawio.png)

## Resources Used
- DICOM Viewer: [BlueLight](https://github.com/cylab-tw/bluelight)
- PACS Server: [Raccoon](https://github.com/Chinlinlee/raccoon-dicom)

## Getting Start
This project was bootstrapped with [Fastify-CLI](https://www.npmjs.com/package/fastify-cli).

### Available Scripts

In the project directory, you can run:

#### `npm run dev`

To start the app in dev mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

#### `npm start`

For production mode

#### `npm run test`

Run the test cases.

### Learn More

To learn Fastify, check out the [Fastify documentation](https://fastify.dev/docs/latest/).


## Future Features
- Frontend Addition
    - Support for user to set up AI Service options on BlueLight
    - Support for user to set up AI Model on AI Orchestrator
- Addition of API to retrieve AI Service settings
- BlueLight adds interface to view Workitem (UPS)