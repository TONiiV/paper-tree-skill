# Paper Tree — Quick Reference

## Column Track Templates

Copy-paste these as starting points and adjust for your field.

### Deep Learning / AI (broad survey)
```js
const COLS = [
  { label:'Training\nMethods',    sub:'Regularization, Normalization, Optimizers' },
  { label:'Representations',      sub:'Embeddings, Pretraining, Self-supervised' },
  { label:'Architectures',        sub:'CNN, RNN, Attention, Transformers' },
  { label:'Core\nTrunk',          sub:'Landmark papers that define the field' },
  { label:'Data &\nDatasets',     sub:'Benchmarks, large-scale datasets' },
  { label:'Domain\nAdaptation',   sub:'Transfer learning, fine-tuning, RLHF' },
  { label:'Applications',         sub:'Downstream tasks, deployed systems' },
];
```

### Generative Models (diffusion, GANs, VAEs)
```js
const COLS = [
  { label:'Score &\nEnergy',      sub:'Score matching, EBMs, Langevin' },
  { label:'Latent\nSpace',        sub:'VAEs, latent diffusion, compression' },
  { label:'Sampling\nMethods',    sub:'DDPM, DDIM, DPM-Solver, flow matching' },
  { label:'Core\nTrunk',          sub:'DDPM → LDM → SDXL → DALL-E 3' },
  { label:'Conditioning',         sub:'Text guidance, classifier-free, ControlNet' },
  { label:'Efficiency',           sub:'Distillation, consistency models, SDXL-Turbo' },
  { label:'Applications',         sub:'Image/video/3D/audio generation' },
];
```

### Reinforcement Learning
```js
const COLS = [
  { label:'Value\nMethods',       sub:'Q-learning, DQN, TD-learning' },
  { label:'Policy\nGradient',     sub:'REINFORCE, A3C, PPO, SAC' },
  { label:'Model-\nBased',        sub:'World models, planning, MuZero' },
  { label:'Core\nTrunk',          sub:'DQN → A3C → PPO → AlphaGo → RLHF' },
  { label:'Environments',         sub:'Atari, MuJoCo, OpenAI Gym, NetHack' },
  { label:'Exploration',          sub:'Curiosity, ICM, count-based' },
  { label:'Alignment &\nSafety',  sub:'RLHF, Constitutional AI, RLAIF' },
];
```

### NLP / Large Language Models
```js
const COLS = [
  { label:'Word\nRepresentation', sub:'Word2Vec, GloVe, FastText' },
  { label:'Sequence\nModeling',   sub:'LSTM, Attention, Transformer variants' },
  { label:'Pretraining',          sub:'BERT, GPT, ELMo, ALBERT, RoBERTa' },
  { label:'Core\nTrunk',          sub:'Transformer → GPT-3 → InstructGPT → ChatGPT' },
  { label:'Efficiency',           sub:'Distillation, quantization, LoRA, adapters' },
  { label:'Reasoning',            sub:'Chain-of-thought, tool use, agents' },
  { label:'Alignment',            sub:'RLHF, Constitutional AI, DPO, RLAIF' },
];
```

### Robotics / VLA
```js
const COLS = [
  { label:'Training\nMethods',    sub:'BC, IL, RL, RLHF' },
  { label:'Perception',           sub:'Visual features, CLIP, 3D representations' },
  { label:'Language\nInterface',  sub:'LLM grounding, instruction following' },
  { label:'Core\nTrunk',          sub:'Transformer → RT-1 → RT-2 → π₀' },
  { label:'Data &\nDatasets',     sub:'Open X-Embodiment, demonstrations' },
  { label:'Robot\nFoundations',   sub:'ACT, Diffusion Policy, classical control' },
  { label:'VLA\nModels',          sub:'End-to-end vision-language-action' },
  { label:'Open /\nSpecialized',  sub:'Open-source models, domain specializations' },
];
```

### Computer Vision (broad)
```js
const COLS = [
  { label:'Backbone\nArchitecture', sub:'LeNet, AlexNet, VGG, ResNet, ViT' },
  { label:'Detection &\nSegmentation', sub:'RCNN, YOLO, Mask-RCNN, SAM' },
  { label:'Self-Supervised', sub:'SimCLR, MoCo, DINO, MAE' },
  { label:'Core\nTrunk',    sub:'Key papers that drove CV forward' },
  { label:'Vision-\nLanguage', sub:'CLIP, Flamingo, LLaVA, GPT-4V' },
  { label:'Generation',     sub:'GAN, VAE, Diffusion, NeRF' },
  { label:'3D & Video',     sub:'PointNet, 3DGS, video understanding' },
];
```

---

## Color Palette Reference

Use these for `CATS` color fields:

| Role             | Color     | Hex      |
|------------------|-----------|----------|
| Foundations      | Blue      | `#5b9cf6` |
| NLP / Text       | Purple    | `#a07ae8` |
| Vision           | Teal      | `#52c2a0` |
| Training methods | Amber     | `#e0a048` |
| Milestones       | Red       | `#e06060` |
| Robotics/Control | Green     | `#86c468` |
| Domain models    | Sky blue  | `#5ab0d8` |
| Data/Datasets    | Coral     | `#d47a5e` |
| Safety/Alignment | Lavender  | `#8b7fd6` |

---

## Row Spacing Guide

| Field activity level | Spacing | Notes |
|---------------------|---------|-------|
| Sparse (1 paper/year) | 80px | Good for pre-2015 periods |
| Normal (2-3/year)     | 72px | Default |
| Dense (4+/year)       | 60px | Use for 2022-2024 in fast-moving fields |
| Same year, 2 papers in same col | Add sub-era | e.g. '2023 H1' and '2023 H2' |

---

## Common Mistakes to Avoid

1. **Don't reuse (col, era) for two papers** — they will overlap
2. **Don't draw edges backward in time** — edges should always go from older to newer
3. **Don't mark every paper as star:true** — should be ~35-45% max
4. **Don't make up arXiv IDs** — verify each URL before including
5. **Don't put too many papers in Core Trunk** — max 8-10 for visual clarity
6. **Don't forget the "boring" papers** — datasets, normalization techniques, training tricks are essential to the story
7. **Don't skip the desc field** — it's the most valuable part of the detail panel

---

## Output File Naming

```
paper_tree_diffusion.html     # Diffusion models
paper_tree_rl.html            # Reinforcement learning  
paper_tree_nlp.html           # NLP broad survey
paper_tree_vla.html           # Vision-Language-Action
paper_tree_cv.html            # Computer vision
paper_tree_bert_family.html   # Focused: BERT variants
paper_tree_gpt_family.html    # Focused: GPT series
paper_tree_[field].html       # Your field here
```
