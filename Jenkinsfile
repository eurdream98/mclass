pipeline {
    agent any
    tools{
        maven 'maven 3.9.11'
        nodejs 'node18'
    }

    environment{
        DOCKER_IMAGE="demo-app"
        CONTAINER_NAME="springboot-container"
        JAR_FILE_NAME="app.jar"
        PORT="8081"

        REMOTE_USER = "ec2-user"
        REMOTE_HOST = "43.202.91.164"

        REMOTE_DIR = "/home/ec2-user/deploy"

        SSH_CREDENTIALS_ID = "057d957a-6607-4a5d-b2f0-a9116adbf5d2"
        PATH="/usr/bin:/usr/local/bin:${env.PATH}"
    }

    stages{
        stage('Git Checkout'){
            steps{
                checkout scm
            }
        }

         /* ---------------------------------------
         * ⭐ 1. Frontend Build (React)
         * --------------------------------------- */
        stage('Frontend Build'){
            steps{
                dir('frontend'){
                    sh 'npm install'
                    sh 'npm run build'
                }
            }
        }

        /* ---------------------------------------
         * ⭐ 2. React Build → Spring static 자동 복사
         * --------------------------------------- */
        stage('Copy Frontend Build to Backend'){
            steps{
                // 기존 static 제거
                sh 'rm -rf src/main/resources/static/*'

                // React build 결과 복사
                sh 'cp -r frontend/build/* src/main/resources/static/'
            }
        }


        stage('Maven Build'){
            steps{
                sh 'mvn clean package -DskipTests'
            }
        }

        stage('Prepare Jar'){
            steps{
                sh 'cp target/demo-0.0.1-SNAPSHOT.jar ${JAR_FILE_NAME}'
            }
        }

        stage('Copy to Remote Server'){
            steps{
                sshagent(credentials: [env.SSH_CREDENTIALS_ID]) {
                    sh "ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null ${REMOTE_USER}@${REMOTE_HOST} \"mkdir -p ${REMOTE_DIR}\""

                    // JAR 파일과 Dockerfile을 원격 서버에 복사
                    sh "scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null ${JAR_FILE_NAME} Dockerfile ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}/"
            }
        }
    }

    stage('Remote Docker Build & Deploy'){
        steps{
            sshagent(credentials: [env.SSH_CREDENTIALS_ID]){
                sh"""
ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null ${REMOTE_USER}@${REMOTE_HOST} << ENDSSH
cd ${REMOTE_DIR} || exit 1
docker rm -f ${CONTAINER_NAME} || true
docker build -t ${DOCKER_IMAGE} .
docker run -d --name ${CONTAINER_NAME} -p ${PORT}:${PORT} ${DOCKER_IMAGE}
ENDSSH
                """
            }
        }
    }
    }
}