apiVersion: apps/v1
kind: Deployment
metadata:
  name: gcp-cnci-example-app
  labels:
    app: gcp-cnci-example-app
spec:
  replicas: 1
  selector:
    matchLabels:
      app: gcp-cnci-example-app
  template:
    metadata:
      labels:
        app: gcp-cnci-example-app
    spec:
      containers:
      - name: gcp-cnci-example-app
        image: IMAGE_TO_DEPLOY
        ports:
        - containerPort: 8080
        env:
        - name: ENVIRONMENT_NAME
          value: "staging"
---
kind: Service
apiVersion: v1
metadata:
  name: gcp-cnci-example-app
spec:
  selector:
    app: gcp-cnci-example-app
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8080
  type: LoadBalancer