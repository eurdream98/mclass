import openai
from pinecone import Pinecone, ServerlessSpec
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

# OpenAI API 키 설정
openai.api_key = "your-api-key"
pc = Pinecone(api_key="your-pinecone-key")
index = pc.Index("your-index-name")

def embed_text(text):
    """텍스트를 임베딩으로 변환"""
    response = openai.Embedding.create(
        input=text,
        model="text-embedding-ada-002"
    )
    return response['data'][0]['embedding']

def search_similar_documents(query_embedding, top_k=3, threshold=0.7):
    """벡터 DB에서 유사 문서 검색"""
    results = index.query(
        vector=query_embedding,
        top_k=top_k,
        include_metadata=True
    )
    
    # 유사도 임계값 필터링
    filtered_results = [
        match for match in results.matches 
        if match.score >= threshold
    ]
    
    return filtered_results

def generate_answer(query, context_documents):
    """GPT-4를 사용하여 답변 생성"""
    # 검색된 문서를 컨텍스트로 구성
    context = "\n\n".join([
        doc.metadata.get('text', '') for doc in context_documents
    ])
    
    prompt = f"""다음 문서들을 참고하여 질문에 답변해주세요.

문서:
{context}

질문: {query}
답변:"""
    
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.7  # 기본 설정
    )
    
    return response.choices[0].message.content

def rag_pipeline(user_query):
    """RAG 파이프라인 메인 함수"""
    # 1. 사용자 질문 임베딩
    query_embedding = embed_text(user_query)
    
    # 2. 벡터 DB에서 유사 문서 검색
    similar_docs = search_similar_documents(
        query_embedding, 
        top_k=3, 
        threshold=0.7
    )
    
    # 3. GPT-4로 답변 생성
    answer = generate_answer(user_query, similar_docs)
    
    return answer

# 사용 예시
if __name__ == "__main__":
    query = "파리의 수도는 어디인가요?"
    answer = rag_pipeline(query)
    print(answer)

