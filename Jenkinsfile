pipeline {
    agent any

    environment {
        IMAGE_NAME = 'jinyoung1226/front-server'
    }

    stages {

        stage('01. Git Checkout') {
            steps {
                checkout scm
            }
        }

        stage('02. Docker Hub Login') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'docker-hub-credentials',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASSWORD'
                    )
                ]) {
                    sh '''
                        echo "$DOCKER_PASSWORD" | docker login \
                        -u "$DOCKER_USER" \
                        --password-stdin
                    '''
                }
            }
        }

        stage('03. Build Image') {
            steps {
                withCredentials([
                    string(credentialsId: 'vite-api-base-url', variable: 'VITE_API_BASE_URL')
                ]) {
                    sh '''
                        docker build \
                            --build-arg VITE_API_BASE_URL="$VITE_API_BASE_URL" \
                            -t $IMAGE_NAME .
                    '''
                }
            }
        }

        stage('04. Push Image') {
            steps {
                sh 'docker push $IMAGE_NAME'
            }
        }

        stage('05. Deploy to Server') {
            steps {
                withCredentials([
                    sshUserPrivateKey(
                        credentialsId: 'deploy-server-ssh',
                        keyFileVariable: 'SSH_KEY',
                        usernameVariable: 'DEPLOY_USERNAME'
                    ),
                    string(credentialsId: 'deploy-server-ip', variable: 'DEPLOY_IP'),
                    string(credentialsId: 'deploy-server-port', variable: 'DEPLOY_PORT')
                ]) {

                    sh '''
                    ssh -p "$DEPLOY_PORT" -i "$SSH_KEY" -o StrictHostKeyChecking=no \
                    "$DEPLOY_USERNAME@$DEPLOY_IP" "
                        docker pull jinyoung1226/front-server &&
                        docker stop front-server || true &&
                        docker rm front-server || true &&
                        docker run -d --name front-server --network skala-mini -p 3001:3001 jinyoung1226/front-server &&
                        docker image prune -f
                    "
                    '''
                }
            }
}
    }
}