import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

# 모델과 토크나이저 로드
model_name = "rinna/japanese-gpt-neox-3.6b"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(
    model_name,
    torch_dtype=torch.float16,  # float16 사용 (양자화X)
    device_map="auto"           # 자동으로 MPS 사용
)

# 입력 설정
user_input = "こんにちは！今日は寒いですね。"
device = "mps" if torch.backends.mps.is_available() else "cpu"
input_ids = tokenizer(user_input, return_tensors="pt").input_ids.to(device)

# 모델 실행
with torch.no_grad():
    output = model.generate(input_ids, max_length=50, do_sample=True, top_p=0.9, temperature=0.8)

# 결과 출력
response = tokenizer.decode(output[0], skip_special_tokens=True)
print(response)