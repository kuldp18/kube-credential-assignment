# Kubernetes Deployment Guide

This directory contains Kubernetes configuration files for deploying the Kube Credential application.

## Architecture Overview

The application consists of:

- **Frontend**: React application served via Nginx (exposed publicly)
- **Issuance Service**: Backend microservice for credential issuance (StatefulSet)
  - Uses StatefulSet for predictable pod naming
  - Each pod receives a unique `WORKER_NAME` environment variable (e.g., `issuance-service-0`, `issuance-service-1`)
  - Enables distributed worker identification and task management
- **Verification Service**: Backend microservice for credential verification

## Prerequisites

1. **Kubernetes Cluster**: Running Kubernetes cluster (v1.19+)
2. **kubectl**: Installed and configured to access your cluster
3. **NGINX Ingress Controller**: Must be installed in the cluster
4. **MongoDB**: Running MongoDB instance (URI to be configured)

### Install NGINX Ingress Controller

If not already installed:

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml
```

For Minikube:

```bash
minikube addons enable ingress
```

## Configuration Files

### Core Resources

- `namespace.yaml` - Creates the kube-credential namespace
- `secrets.yaml` - Stores sensitive data (MongoDB URI)
- `configmap.yaml` - Application configuration

### Issuance Service

- `issuance-deployment.yaml` - StatefulSet with 2 replicas (uses predictable pod naming)
- `issuance-service.yaml` - ClusterIP service on port 5000

**Note**: Issuance service uses a StatefulSet to ensure predictable pod naming:

- Pods are named: `issuance-service-0`, `issuance-service-1`, etc.
- Each pod gets a unique `WORKER_NAME` environment variable set to its pod name
- This enables proper worker identification and distributed task processing

### Verification Service

- `verification-deployment.yaml` - Deployment with 2 replicas
- `verification-service.yaml` - ClusterIP service on port 5001

### Frontend

- `frontend-deployment.yaml` - Deployment with 2 replicas
- `frontend-service.yaml` - ClusterIP service on port 80

### Ingress

- `ingress.yaml` - NGINX Ingress for routing external traffic

## Deployment Steps

### Step 1: Configure Secrets

Before deploying, update the MongoDB URI in `secrets.yaml`:

```yaml
stringData:
  mongo-uri: "mongodb://username:password@mongodb-host:27017/credentials"
```

### Step 2: Deploy All Resources

Deploy in the following order:

```bash
# Create namespace
kubectl apply -f namespace.yaml

# Create secrets and config
kubectl apply -f secrets.yaml
kubectl apply -f configmap.yaml

# Deploy backend services
kubectl apply -f issuance-deployment.yaml
kubectl apply -f issuance-service.yaml
kubectl apply -f verification-deployment.yaml
kubectl apply -f verification-service.yaml

# Deploy frontend
kubectl apply -f frontend-deployment.yaml
kubectl apply -f frontend-service.yaml

# Create ingress
kubectl apply -f ingress.yaml
```

Or deploy everything at once:

```bash
kubectl apply -f k8s/
```

### Step 3: Configure DNS/Hosts

Add the ingress IP to your hosts file:

```bash
# Get the ingress IP
kubectl get ingress -n kube-credential

# Add to /etc/hosts (Linux/Mac) or C:\Windows\System32\drivers\etc\hosts (Windows)
<INGRESS_IP> kube-credential.local
```

For Minikube:

```bash
minikube ip
# Use this IP in your hosts file
```

### Step 4: Access the Application

Open your browser and navigate to:

```
http://kube-credential.local
```

## API Routes

The ingress routes traffic as follows:

- `http://kube-credential.local/` → Frontend (React app)
- `http://kube-credential.local/issue` → Issuance Service
- `http://kube-credential.local/verify` → Verification Service

Backend services receive requests with proper path rewriting:

- `/issue` → `http://issuance-service:5000/api/services/issuance/issue`
- `/verify` → `http://verification-service:5001/api/services/verification/verify`

## Verification

Check deployment status:

```bash
# Check all resources
kubectl get all -n kube-credential

# Check pods (note issuance pods have predictable names)
kubectl get pods -n kube-credential
# Expected: issuance-service-0, issuance-service-1, verification-service-xxx, frontend-xxx

# Check services
kubectl get svc -n kube-credential

# Check ingress
kubectl get ingress -n kube-credential

# View logs
kubectl logs -n kube-credential -l app=issuance-service
kubectl logs -n kube-credential -l app=verification-service
kubectl logs -n kube-credential -l app=frontend

# View logs for specific issuance worker
kubectl logs -n kube-credential issuance-service-0
kubectl logs -n kube-credential issuance-service-1

# Verify WORKER_NAME environment variable
kubectl exec -it issuance-service-0 -n kube-credential -- env | grep WORKER_NAME
# Should output: WORKER_NAME=issuance-service-0
```

## Troubleshooting

### Pods not starting

```bash
# Describe the pod
kubectl describe pod <pod-name> -n kube-credential

# Check events
kubectl get events -n kube-credential --sort-by='.lastTimestamp'
```

### Service connectivity issues

```bash
# Test service from within the cluster
kubectl run -it --rm debug --image=curlimages/curl --restart=Never -n kube-credential -- sh
# Inside the pod:
curl http://issuance-service:5000/api/services/issuance/internal/check
curl http://verification-service:5001/api/services/verification/verify
```

### Ingress not working

```bash
# Check ingress controller logs
kubectl logs -n ingress-nginx -l app.kubernetes.io/component=controller

# Verify ingress configuration
kubectl describe ingress kube-credential-ingress -n kube-credential
```

### MongoDB connection issues

```bash
# Check if secret is properly created
kubectl get secret mongodb-secret -n kube-credential -o yaml

# Check environment variables in pod
kubectl exec -it <pod-name> -n kube-credential -- env | grep MONGO
```

## Scaling

Scale deployments as needed:

```bash
# Scale issuance service (StatefulSet)
# Note: New pods will be named issuance-service-0, issuance-service-1, issuance-service-2, etc.
kubectl scale statefulset issuance-service -n kube-credential --replicas=3

# Scale verification service
kubectl scale deployment verification-service -n kube-credential --replicas=3

# Scale frontend
kubectl scale deployment frontend -n kube-credential --replicas=3
```

**Important**: Issuance service uses StatefulSet, so scaling creates pods with predictable names (worker-0, worker-1, worker-2, etc.). Each pod will have a unique WORKER_NAME matching its pod name.

## Updates

Update container images:

```bash
# Update image
kubectl set image deployment/issuance-service issuance-service=kuldp18/kube-credential-issuance:2.0 -n kube-credential

# Check rollout status
kubectl rollout status deployment/issuance-service -n kube-credential

# Rollback if needed
kubectl rollout undo deployment/issuance-service -n kube-credential
```

## Cleanup

Remove all resources:

```bash
# Delete all resources in namespace
kubectl delete namespace kube-credential
```

Or delete individually:

```bash
kubectl delete -f k8s/
```

## Production Considerations

For production deployments, consider:

1. **TLS/HTTPS**: Add SSL certificates to ingress
2. **Resource Limits**: Adjust CPU/memory based on load testing
3. **Horizontal Pod Autoscaling**: Enable HPA for automatic scaling
4. **Persistent Storage**: Use PersistentVolumes for MongoDB
5. **Health Checks**: Ensure proper liveness/readiness probes
6. **Network Policies**: Restrict pod-to-pod communication
7. **Secrets Management**: Use external secret managers (Vault, AWS Secrets Manager)
8. **Monitoring**: Set up Prometheus/Grafana for monitoring
9. **Logging**: Configure centralized logging (ELK, Loki)
10. **Backup**: Regular database backups

## Notes

- All backend services use ClusterIP (not exposed externally)
- Only frontend is accessible via ingress
- Services communicate internally via Kubernetes DNS
- MongoDB connection string must be updated before deployment
- NGINX Ingress Controller required for routing
- Health check endpoints should be implemented in services for proper probe functionality
