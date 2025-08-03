FROM runpod/base:0.4.0-cuda11.8.0

# Installeer Python dependencies
COPY builder/requirements.txt /requirements.txt
RUN python3.11 -m pip install --upgrade pip && \
    python3.11 -m pip install --upgrade -r /requirements.txt --no-cache-dir && \
    rm /requirements.txt

# Voeg de handler toe
ADD src .

# ❌ NIET uitvoeren tijdens build
# RUN python3.11 /handler.py

# ✅ Laat RunPod het starten bij een job
CMD python3.11 -u /handler.py
