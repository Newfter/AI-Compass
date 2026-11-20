/* =========================================================
   AI COMPASS — GUIDED COURSE: RESEARCH FRONTIER
   The last stage of "My path", for PhD students and researchers:
   twelve guided steps on the ideas behind current research, with the
   derivations and the numbers done by hand.
     r1   Attention at scale
     r2   Scaling laws
     r3   Optimisers for large models
     r4   Why giant networks generalise
     r5   Latent variables and the ELBO
     r6   Diffusion models
     r7   Reinforcement learning: the core
     r8   Learning from preferences: RLHF and DPO
     r9   Inside the model: interpretability
     r10  Smaller and faster models
     r11  Reasoning and test-time compute
     r12  Research that holds up
   The screens are shown one by one by js/learn-play.js. How a screen is
   written is explained at the top of js/content/courses/zero.js:
   - in a "choice", the FIRST option is the right one;
   - "number": the learner types the answer; "tolerance" is how far off
     it may be, and "share": true lets a share or a probability from 0 to 1
     be typed as a percentage ("81%"). Russian texts write decimals with a comma;
   - "card": the task also becomes a card of the memory check. A card must
     make sense alone.
   The level check asks nothing about this stage: it is the last one, so a
   learner who knows every stage before it starts here anyway.
   No company, product or model is named in this course, on purpose.
   Results from the literature are stated as carefully as the evidence
   allows, and where research is unsettled the texts say so.
   The names of the steps are in js/content/learn.js ("learn.unit.r1"...).
   ========================================================= */

window.AICompass.content.set("course.research", {
    units: {
        /* ----- r1. Attention at scale ----- */
        r1: {
            steps: [
                {
                    type: "info", icon: "📏", mono: true,
                    en: {
                        title: "Why divide by √d_k",
                        text: [
                            "A score is the dot product q·k of a query and a key, each with d_k entries. Assume that all entries are independent, with mean 0 and variance 1. Then every product q_i·k_i has variance 1, and their sum q·k has variance d_k.",
                            "With d_k = 64 the scores have a standard deviation of 8. Softmax of such spread-out scores tends to put almost all the weight on one or a few keys, and most of its gradients become tiny: it **saturates**. Dividing the scores by √d_k = 8 brings their variance back to 1."
                        ],
                        example: ["Var(q_i·k_i) = E[q_i²]·E[k_i²] = 1", "Var(q·k) = Σ_i Var(q_i·k_i) = d_k", "Var(q·k / √d_k) = 1", "Attention(Q, K, V) = softmax(Q·K^T / √d_k)·V"]
                    },
                    ru: {
                        title: "Зачем делить на √d_k",
                        text: [
                            "Оценка — это скалярное произведение q·k запроса и ключа, у каждого из которых d_k компонент. Пусть все компоненты независимы, их среднее равно 0, а дисперсия — 1. Тогда у каждого произведения q_i·k_i дисперсия 1, а у их суммы q·k — d_k.",
                            "При d_k = 64 стандартное отклонение оценок равно 8. Softmax от оценок с таким разбросом обычно отдаёт почти весь вес одному или нескольким ключам, и большинство его градиентов становятся крошечными: наступает **насыщение** (saturation). Деление оценок на √d_k = 8 возвращает их дисперсию к 1."
                        ],
                        example: ["Var(q_i·k_i) = E[q_i²]·E[k_i²] = 1", "Var(q·k) = Σ_i Var(q_i·k_i) = d_k", "Var(q·k / √d_k) = 1", "Attention(Q, K, V) = softmax(Q·K^T / √d_k)·V"]
                    }
                },
                {
                    type: "number", answer: 16, card: "r1a",
                    en: {
                        q: "All entries of a query q and a key k are independent, with mean 0 and variance 1, and each vector has d_k = 256 entries. What is the standard deviation of their dot product q·k?",
                        hint: "Each of the 256 products q_i·k_i has variance 1, and the variances of independent terms add.",
                        why: "Each product q_i·k_i has variance E[q_i²]·E[k_i²] = 1, and the variances of the 256 independent products add: Var(q·k) = 256 · 1 = 256. The standard deviation is √256 = 16. Dividing the scores by √d_k = 16 brings their variance back to 1, which helps keep softmax out of saturation."
                    },
                    ru: {
                        q: "Все компоненты запроса q и ключа k независимы, их среднее равно 0, а дисперсия — 1. В каждом векторе d_k = 256 компонент. Чему равно стандартное отклонение скалярного произведения q·k?",
                        hint: "У каждого из 256 произведений q_i·k_i дисперсия 1, а дисперсии независимых слагаемых складываются.",
                        why: "У каждого произведения q_i·k_i дисперсия E[q_i²]·E[k_i²] = 1, а дисперсии 256 независимых произведений складываются: Var(q·k) = 256 · 1 = 256. Стандартное отклонение равно √256 = 16. Если поделить оценки на √d_k = 16, их дисперсия снова будет равна 1, а это помогает softmax не уходить в насыщение."
                    }
                },
                {
                    type: "info", icon: "🎭",
                    en: {
                        title: "The causal mask",
                        text: [
                            "An autoregressive language model is trained to predict the next token at every position of a text, all in one parallel pass. So the output at each position may depend only on that token and the ones before it.",
                            "The **causal mask** sets the score of every key that comes after the query to −∞ before the softmax (in code, often a very large negative number), so its weight is 0. Of the n² query–key pairs, n(n + 1)/2 remain: 10 of 16 for n = 4."
                        ],
                        note: "In a plain implementation the mask saves no work: the masked scores are computed and then thrown away."
                    },
                    ru: {
                        title: "Каузальная маска",
                        text: [
                            "Авторегрессионную языковую модель обучают предсказывать следующий токен в каждой позиции текста, причём все позиции обрабатываются за один параллельный проход. Значит, выход в каждой позиции может зависеть только от её токена и предыдущих.",
                            "**Каузальная маска** (causal mask) перед softmax заменяет оценку каждого ключа, стоящего позже запроса, на −∞ (в коде часто на очень большое отрицательное число), так что вес такого ключа равен 0. Из n² пар «запрос — ключ» остаётся n(n + 1)/2: при n = 4 это 10 из 16."
                        ],
                        note: "В простой реализации маска не экономит вычислений: замаскированные оценки сначала вычисляются, а потом выбрасываются."
                    }
                },
                {
                    type: "choice",
                    en: {
                        q: "A language model is trained to predict every next token of a 1000-token text in one parallel pass. What goes wrong if the causal mask is removed?",
                        options: ["Each position can see the token it must predict, so the model learns to copy it", "Softmax can no longer be computed, because some of the scores become infinite", "Memory runs out, because it is the mask that keeps the score matrix small", "The model can then learn only from the first token of every text"],
                        hint: "Think about which token position t is trained to predict, and where that token sits in the input.",
                        why: "Without the mask, position t can attend to token t + 1, the very token it must predict. The model then lowers the loss just by copying, and it is of little use for generation, where that token does not exist yet. Infinite scores appear only with the mask, as −∞, and they give weights of exactly 0."
                    },
                    ru: {
                        q: "Языковую модель обучают предсказывать каждый следующий токен в тексте из 1000 токенов за один параллельный проход. Что пойдёт не так, если убрать каузальную маску?",
                        options: ["Каждая позиция видит токен, который ей нужно предсказать, и модель учится его копировать", "Softmax уже нельзя вычислить, потому что часть оценок становится бесконечной", "Закончится память, ведь именно маска не даёт матрице оценок разрастись", "Модель сможет учиться только на первом токене каждого текста"],
                        hint: "Подумай, какой токен учится предсказывать позиция t и где этот токен стоит на входе.",
                        why: "Без маски позиция t может смотреть на токен t + 1 — тот самый, который ей нужно предсказать. Тогда модель снижает функцию потерь простым копированием, а для генерации почти бесполезна: там этого токена ещё нет. Бесконечные оценки появляются только с маской, в виде −∞, и дают веса, равные ровно 0."
                    }
                },
                {
                    type: "info", icon: "🗄️", mono: true,
                    en: {
                        title: "The KV cache",
                        text: [
                            "To generate the next token, attention in every layer needs the keys and values of all tokens so far. Because of the causal mask, they never change when later tokens arrive, so they are stored instead of being computed again: the **KV cache**.",
                            "Each step then computes the query, key and value of the new token only, in every layer, and appends the new key and value to the cache."
                        ],
                        example: ["cache per token = 2 · layers · KV heads · head size · bytes per number", "2 · 32 · 32 · 128 · 2 = 524,288 bytes = 2¹⁹ bytes = 0.5 MiB"],
                        note: "The 2 counts keys and values, and the head size is d_k. In plain multi-head attention every head has its own keys and values, so there are as many KV heads as heads. With long contexts and many users at once, the cache can take more memory than the weights."
                    },
                    ru: {
                        title: "KV-кэш",
                        text: [
                            "Чтобы сгенерировать следующий токен, механизму внимания в каждом слое нужны ключи и значения всех предыдущих токенов. Из-за каузальной маски они не меняются, когда появляются новые токены, поэтому их не вычисляют заново, а хранят: это **KV-кэш** (KV cache).",
                            "Тогда на каждом шаге в каждом слое вычисляются запрос, ключ и значение только нового токена, а новые ключ и значение дописываются в кэш."
                        ],
                        example: ["кэш на токен = 2 · слои · KV-головы · размер головы · байты на число", "2 · 32 · 32 · 128 · 2 = 524 288 байт = 2¹⁹ байт = 0,5 МиБ"],
                        note: "Множитель 2 учитывает и ключи, и значения, а размер головы — это d_k. В обычном многоголовом внимании (multi-head attention) у каждой головы свои ключи и значения, так что KV-голов столько же, сколько голов. При длинном контексте и большом числе одновременных пользователей кэш может занимать больше памяти, чем веса."
                    }
                },
                {
                    type: "number", answer: 2, card: "r1b",
                    en: {
                        q: "KV cache per token = 2 · layers · KV heads · head size · bytes per number. With 32 layers, 32 KV heads of size 128 and 2-byte numbers, how many GiB does the cache of one sequence of 4096 tokens take? (1 GiB = 2³⁰ bytes)",
                        hint: "Compute the bytes for one token first, then multiply by 4096 = 2¹².",
                        why: "2 · 32 · 32 · 128 · 2 = 524,288 bytes = 2¹⁹ bytes = 0.5 MiB per token. For 4096 = 2¹² tokens: 2¹⁹ · 2¹² = 2³¹ bytes = 2 · 2³⁰ bytes = 2 GiB. Sixteen such sequences at once need 32 GiB, more than the weights of many models."
                    },
                    ru: {
                        q: "KV-кэш на токен = 2 · слои · KV-головы · размер головы · байты на число. У модели 32 слоя и 32 KV-головы размером 128, числа двухбайтовые. Сколько ГиБ займёт кэш одной последовательности из 4096 токенов? (1 ГиБ = 2³⁰ байт)",
                        hint: "Сначала посчитай байты для одного токена, потом умножь на 4096 = 2¹².",
                        why: "2 · 32 · 32 · 128 · 2 = 524 288 байт = 2¹⁹ байт = 0,5 МиБ на токен. Для 4096 = 2¹² токенов: 2¹⁹ · 2¹² = 2³¹ байт = 2 · 2³⁰ байт = 2 ГиБ. Шестнадцати таким последовательностям одновременно нужно 32 ГиБ — больше, чем занимают веса многих моделей."
                    }
                },
                {
                    type: "info", icon: "👥",
                    en: {
                        title: "Share keys and values between heads",
                        text: [
                            "In **multi-query attention**, all query heads share a single key head and a single value head.",
                            "In **grouped-query attention**, the query heads are split into groups, and each group shares one key head and one value head: for example, 32 query heads in 8 groups of 4.",
                            "The cache is then 32/8 = 4 times smaller than with 32 KV heads, while every query head still computes its own scores. Published comparisons often find grouped-query attention close to full multi-head attention in quality: one reason it is widely used."
                        ],
                        note: "Multi-head and multi-query attention are the two extreme cases of grouped-query attention: one group per query head, and a single group."
                    },
                    ru: {
                        title: "Одни ключи и значения на несколько голов",
                        text: [
                            "Во **внимании с одной головой ключей** (multi-query attention) все головы запросов используют одну общую голову ключей и одну общую голову значений.",
                            "В **групповом внимании по запросам** (grouped-query attention) головы запросов разбиты на группы, и у каждой группы одна общая голова ключей и одна голова значений: например, 32 головы запросов в 8 группах по 4.",
                            "Тогда кэш в 32/8 = 4 раза меньше, чем при 32 KV-головах, а каждая голова запросов по-прежнему считает свои оценки. В опубликованных сравнениях групповое внимание по запросам часто оказывается близким по качеству к полному многоголовому вниманию — это одна из причин, по которым его широко используют."
                        ],
                        note: "Многоголовое внимание и внимание с одной головой ключей — два крайних случая группового: по группе на каждую голову запросов и одна группа на всех."
                    }
                },
                {
                    type: "match",
                    en: {
                        q: "A model has 32 layers, 32 query heads and a head size of 128, and stores 2-byte numbers. Match each design with its KV cache for one sequence of 4096 tokens.",
                        pairs: [
                            ["32 KV heads (multi-head attention)", "2 GiB"],
                            ["8 KV heads (grouped-query attention)", "0.5 GiB"],
                            ["1 KV head (multi-query attention)", "64 MiB"]
                        ],
                        why: "The cache is proportional to the number of KV heads: 2 GiB with 32, 2 GiB · 8/32 = 0.5 GiB with 8, and 2048 MiB / 32 = 64 MiB with 1. Only the keys and values shrink; all 32 query heads remain."
                    },
                    ru: {
                        q: "У модели 32 слоя, 32 головы запросов и размер головы 128, числа двухбайтовые. Сопоставь каждый вариант с размером KV-кэша для одной последовательности из 4096 токенов.",
                        pairs: [
                            ["32 KV-головы (многоголовое внимание)", "2 ГиБ"],
                            ["8 KV-голов (групповое внимание по запросам)", "0,5 ГиБ"],
                            ["1 KV-голова (внимание с одной головой ключей)", "64 МиБ"]
                        ],
                        why: "Кэш пропорционален числу KV-голов: 2 ГиБ при 32, 2 ГиБ · 8/32 = 0,5 ГиБ при 8 и 2048 МиБ / 32 = 64 МиБ при одной. Уменьшаются только ключи и значения: все 32 головы запросов остаются."
                    }
                },
                {
                    type: "info", icon: "⏱️", mono: true,
                    en: {
                        title: "Generating is limited by memory bandwidth",
                        text: [
                            "The prompt is processed in one parallel pass, the **prefill**: each weight read from memory serves many tokens, so with a long prompt the arithmetic units stay busy. Then comes **decoding**, one new token per step.",
                            "In a **dense** model, which uses all its weights for every token, each decoding step of a single sequence reads every weight once, for only about 2 operations per parameter: a multiply and an add.",
                            "A modern accelerator can do a few hundred operations in the time it reads one byte, so during decoding its arithmetic units mostly wait. The speed is then set by the **memory bandwidth**: the number of bytes per second that main memory can deliver."
                        ],
                        example: ["time per token ≥ bytes read per token / memory bandwidth"],
                        note: "This is why servers **batch** many users: one read of the weights then produces a token for every sequence in the batch."
                    },
                    ru: {
                        title: "Генерацию ограничивает пропускная способность памяти",
                        text: [
                            "Сначала весь промпт обрабатывается за один параллельный проход — это фаза **prefill**: каждый вес, прочитанный из памяти, используется для многих токенов, и при длинном промпте вычислительные блоки заняты работой. Затем идёт **декодирование** (decoding): по одному новому токену за шаг.",
                            "В **плотной** (dense) модели, которая использует все свои веса для каждого токена, на каждом шаге декодирования одной последовательности каждый вес читается один раз, а на параметр приходится всего около 2 операций: умножение и сложение.",
                            "Современный ускоритель успевает сделать несколько сотен операций за время чтения одного байта, поэтому при декодировании его вычислительные блоки в основном простаивают. Скорость тогда задаёт **пропускная способность памяти** (memory bandwidth): сколько байт в секунду может отдать основная память."
                        ],
                        example: ["время на токен ≥ байты, прочитанные за токен / пропускная способность памяти"],
                        note: "Поэтому серверы объединяют запросы многих пользователей в **батч** (batch): одно чтение весов даёт новый токен сразу каждой последовательности в батче."
                    }
                },
                {
                    type: "number", answer: 100, card: "r1c",
                    en: {
                        q: "For a single user, each new token requires reading every weight once. The model has 10 billion 2-byte parameters, and the memory bandwidth is 2000 GB/s (1 GB = 10⁹ bytes). At most how many tokens per second can that user get?",
                        hint: "How many GB are read per token, and how long does that take at 2000 GB/s?",
                        why: "10 billion · 2 bytes = 20 GB per token, and 20 / 2000 = 0.01 s = 10 ms per token: at most 100 tokens per second. Reading the KV cache and other work only lower that limit. A batch of 32 users shares each weight read, so total throughput can be almost 32 times higher while the caches stay small compared with the weights."
                    },
                    ru: {
                        q: "На каждый новый токен одного пользователя все веса читаются один раз. У модели 10 миллиардов параметров по 2 байта, пропускная способность памяти — 2000 ГБ/с (1 ГБ = 10⁹ байт). Сколько токенов в секунду он получит самое большее?",
                        hint: "Сколько ГБ читается на один токен и сколько времени это займёт при 2000 ГБ/с?",
                        why: "10 миллиардов · 2 байта = 20 ГБ на токен, а 20 / 2000 = 0,01 с = 10 мс на токен: не больше 100 токенов в секунду. Чтение KV-кэша и прочая работа только снижают этот предел. В батче из 32 пользователей каждое чтение весов служит всем, и суммарная скорость может вырасти почти в 32 раза, пока кэши малы по сравнению с весами."
                    }
                },
                {
                    type: "info", icon: "⚡", mono: true,
                    en: {
                        title: "FlashAttention: the same maths, less traffic",
                        text: [
                            "Plain attention writes the n × n score matrix to the accelerator's slow main memory and reads it back for the softmax, then does the same with the n × n attention weights for the product with V.",
                            "**FlashAttention** splits Q, K and V into **tiles** that fit in the small fast memory on the chip. For each query it keeps a running maximum m, a running sum ℓ and an unnormalised output o, and updates them tile by tile: the **online softmax**. At the end, the output is o / ℓ.",
                            "The n × n matrix never reaches main memory. The result equals plain attention up to rounding, and the extra memory grows like n instead of n². It is faster because it moves far fewer bytes, not because it computes less: the arithmetic is still about O(n²·d_k)."
                        ],
                        example: ["m′ = max(m, max_j s_j)", "ℓ′ = ℓ·e^(m − m′) + Σ_j e^(s_j − m′)", "o′ = o·e^(m − m′) + Σ_j e^(s_j − m′)·v_j"],
                        note: "Here j runs over the keys of the new tile, s_j = q·k_j / √d_k are their scores and v_j their values. When the maximum grows, everything summed so far is rescaled by e^(m − m′)."
                    },
                    ru: {
                        title: "FlashAttention: та же математика, меньше трафика",
                        text: [
                            "Обычное внимание записывает матрицу оценок n × n в медленную основную память ускорителя и снова читает её для softmax, а затем так же поступает с весами внимания n × n при умножении на V.",
                            "**FlashAttention** делит Q, K и V на **тайлы** (tiles), которые помещаются в маленькую быструю память на самом чипе. Для каждого запроса алгоритм хранит текущий максимум m, текущую сумму ℓ и ненормированный выход o и обновляет их тайл за тайлом: это **онлайн-softmax** (online softmax). В конце выход равен o / ℓ.",
                            "Матрица n × n никогда не попадает в основную память. Результат с точностью до округления тот же, что у обычного внимания, а дополнительная память растёт как n вместо n². FlashAttention быстрее не потому, что меньше считает, а потому, что перемещает гораздо меньше байтов: операций по-прежнему около O(n²·d_k)."
                        ],
                        example: ["m′ = max(m, max_j s_j)", "ℓ′ = ℓ·e^(m − m′) + Σ_j e^(s_j − m′)", "o′ = o·e^(m − m′) + Σ_j e^(s_j − m′)·v_j"],
                        note: "Здесь j пробегает ключи нового тайла, s_j = q·k_j / √d_k — их оценки, v_j — их значения. Когда максимум растёт, всё накопленное раньше умножается на e^(m − m′)."
                    }
                },
                {
                    type: "choice", card: "r1d",
                    en: {
                        q: "What does FlashAttention change compared with plain attention?",
                        options: ["It computes exact attention tile by tile, so the n × n scores never go to slow memory", "It replaces the softmax with an approximation whose cost grows only linearly with n", "It skips the keys of distant tokens, so each query attends only to a local window", "It lets all query heads share one key head and one value head, so the cache shrinks"],
                        why: "FlashAttention gives the same output up to rounding and still does about O(n²·d_k) arithmetic: it is faster because it moves far fewer bytes. Approximating the softmax or skipping keys would change the result. Shared key and value heads are multi-query attention, a different idea that shrinks the KV cache."
                    },
                    ru: {
                        q: "Что меняет FlashAttention по сравнению с обычным вниманием?",
                        options: ["Считает точное внимание по тайлам, и оценки n × n не попадают в медленную память", "Заменяет softmax приближением, стоимость которого растёт лишь линейно по n", "Пропускает ключи далёких токенов, так что каждый запрос видит лишь локальное окно", "Даёт всем головам запросов одну общую голову ключей и одну — значений, и кэш уменьшается"],
                        why: "У FlashAttention тот же результат с точностью до округления, операций по-прежнему около O(n²·d_k), а ускорение получается за счёт гораздо меньшего трафика памяти. Приближение softmax или пропуск ключей изменили бы результат. Общие головы ключей и значений — это внимание с одной головой ключей: другая идея, уменьшающая KV-кэш."
                    }
                },
                {
                    type: "recap",
                    en: {
                        points: [
                            "If the entries of q and k are independent, with mean 0 and variance 1, then `Var(q·k) = d_k`. Dividing the scores by √d_k brings the variance back to 1, which helps keep softmax out of saturation.",
                            "The causal mask hides later tokens. That is also why the keys and values of past tokens never change and can be cached.",
                            "`KV cache per token = 2 · layers · KV heads · head size · bytes per number`. Grouped-query and multi-query attention shrink it by sharing KV heads among query heads.",
                            "At batch size 1, decoding is limited by memory bandwidth: `tokens per second ≤ bandwidth / bytes read per token`. FlashAttention is exact attention that saves memory traffic, not arithmetic."
                        ]
                    },
                    ru: {
                        points: [
                            "Если компоненты q и k независимы, со средним 0 и дисперсией 1, то `Var(q·k) = d_k`. Деление оценок на √d_k возвращает дисперсию к 1, и это помогает softmax не уходить в насыщение.",
                            "Каузальная маска скрывает более поздние токены. Из-за неё же ключи и значения предыдущих токенов не меняются, и их можно кэшировать.",
                            "`KV-кэш на токен = 2 · слои · KV-головы · размер головы · байты на число`. Групповое внимание по запросам и внимание с одной головой ключей уменьшают его: одну KV-голову используют сразу несколько голов запросов.",
                            "При размере батча 1 декодирование упирается в пропускную способность памяти: `токенов в секунду ≤ пропускная способность / байты, прочитанные за токен`. FlashAttention — точное внимание, которое экономит трафик памяти, а не вычисления."
                        ]
                    }
                }
            ]
        },

        /* ----- r2. Scaling laws ----- */
        r2: {
            steps: [
                {
                    type: "info", icon: "📈", mono: true,
                    en: {
                        title: "Loss falls as a power law",
                        text: [
                            "In the language models studied, the test loss L (cross-entropy in nats per token) falls smoothly and predictably as the number of parameters N, the number of training tokens D and the training compute C grow. This holds as long as nothing else is the bottleneck.",
                            "These regularities are called **scaling laws**. They match measured training runs over many orders of magnitude.",
                            "One widely used form splits the loss into the **irreducible loss** E, which no model can beat on this data, and the **reducible loss** above it. Each term of the reducible loss is a **power law**: a straight line on log–log axes (both axes logarithmic)."
                        ],
                        example: ["L(N, D) = E + A/N^α + B/D^β", "ln(A/N^α) = ln A − α·ln N: slope −α", "E, A, B, α, β: constants fitted to training runs", "one widely used 2022 fit: α ≈ 0.34, β ≈ 0.28"]
                    },
                    ru: {
                        title: "Функция потерь убывает по степенному закону",
                        text: [
                            "У изученных языковых моделей функция потерь L на тестовых данных (кросс-энтропия в натах на токен) плавно и предсказуемо убывает с ростом числа параметров N, числа обучающих токенов D и объёма вычислений на обучение C. Так происходит, пока узким местом не становится что-то другое.",
                            "Такие закономерности называют **законами масштабирования** (scaling laws). Они согласуются с реальными запусками обучения на протяжении многих порядков величины.",
                            "Одна из распространённых форм делит функцию потерь на **неустранимую ошибку** (irreducible loss) E, ниже которой на этих данных не опустится ни одна модель, и **устранимую ошибку** (reducible loss) — всё, что выше E. Каждое её слагаемое убывает по **степенному закону** (power law): в логарифмических осях (log–log) это прямая."
                        ],
                        example: ["L(N, D) = E + A/N^α + B/D^β", "ln(A/N^α) = ln A − α·ln N: наклон −α", "E, A, B, α, β: константы, подобранные по запускам обучения", "одна широко используемая аппроксимация 2022 года: α ≈ 0,34; β ≈ 0,28"]
                    }
                },
                {
                    type: "number", answer: 8, card: "r2a",
                    en: {
                        q: "A language model's loss depends on its number of parameters N as L = E + A/N^α, where E and A are constants and α = 1/3. By what factor must N grow to halve the reducible part A/N^α?",
                        hint: "Halving A/N^α means doubling N^α. Which number gives 2 when raised to the power 1/3?",
                        why: "Growing N by a factor k multiplies N^(1/3) by k^(1/3). Halving A/N^(1/3) needs k^(1/3) = 2, so k = 2³ = 8. In general the factor is 2^(1/α), and every further halving needs that factor again: steady progress, but steeply diminishing returns."
                    },
                    ru: {
                        q: "Функция потерь языковой модели зависит от числа параметров N так: L = E + A/N^α, где E и A — константы, а α = 1/3. Во сколько раз нужно увеличить N, чтобы устранимая часть A/N^α уменьшилась вдвое?",
                        hint: "Уменьшить A/N^α вдвое — значит удвоить N^α. Какое число в степени 1/3 даёт 2?",
                        why: "Если N вырастет в k раз, то N^(1/3) вырастет в k^(1/3) раз. Чтобы A/N^(1/3) уменьшилось вдвое, нужно k^(1/3) = 2, то есть k = 2³ = 8. В общем случае множитель равен 2^(1/α), и каждое следующее уменьшение вдвое требует того же множителя ещё раз: прогресс устойчивый, но отдача быстро убывает."
                    }
                },
                {
                    type: "info", icon: "🧮", mono: true,
                    en: {
                        title: "Training compute: C ≈ 6·N·D",
                        text: [
                            "Training compute C is counted in **FLOPs**, floating-point operations. In a **dense** transformer every token goes through all the weights. In the forward pass each weight of a matrix multiplication takes part in one multiply and one add per token: 2 FLOPs.",
                            "The backward pass costs about twice as much: one matrix product of the same size gives the gradients with respect to the activations, another the gradients with respect to the weights. For N parameters and D training tokens:"
                        ],
                        example: ["forward ≈ 2·N FLOPs per token", "backward ≈ 4·N FLOPs per token", "C ≈ 6·N·D"],
                        note: "The formula leaves out the attention operations themselves (the scores and the weighted sums of values), whose share grows with the context length; for moderate contexts it is small."
                    },
                    ru: {
                        title: "Объём вычислений на обучение: C ≈ 6·N·D",
                        text: [
                            "Объём вычислений на обучение C измеряют в **операциях с плавающей точкой** (FLOP). В **плотном** (dense) трансформере каждый токен проходит через все веса. В прямом проходе (forward pass) каждый вес в матричном умножении даёт на каждый токен одно умножение и одно сложение: 2 флопа.",
                            "Обратный проход (backward pass) примерно вдвое дороже: одно матричное произведение того же размера даёт градиенты по активациям, другое — градиенты по весам. Для N параметров и D обучающих токенов:"
                        ],
                        example: ["прямой проход ≈ 2·N флопов на токен", "обратный проход ≈ 4·N флопов на токен", "C ≈ 6·N·D"],
                        note: "Формула не учитывает вычисления самого внимания (оценки и взвешенные суммы значений): их доля растёт с длиной контекста, но при умеренной длине она мала."
                    }
                },
                {
                    type: "number", answer: 6, card: "r2b",
                    en: {
                        q: "Training a dense transformer (every token goes through all the weights) costs roughly how many FLOPs (floating-point operations) per parameter and per training token, forward and backward passes together?",
                        hint: "The forward pass needs a multiply and an add per parameter, and the backward pass about twice as much as the forward.",
                        why: "The forward pass costs 2 per parameter (a multiply and an add), the backward pass about 4 (gradients with respect to the activations and to the weights): 6 in total. So training costs C ≈ 6·N·D FLOPs for N parameters and D tokens."
                    },
                    ru: {
                        q: "Сколько примерно операций с плавающей точкой (FLOP) приходится на один параметр и один обучающий токен при обучении плотного трансформера (каждый токен проходит через все веса), если сложить прямой и обратный проходы?",
                        hint: "В прямом проходе на каждый параметр приходятся одно умножение и одно сложение, а обратный проход примерно вдвое дороже прямого.",
                        why: "Прямой проход — 2 на параметр (умножение и сложение), обратный — около 4 (градиенты по активациям и по весам): всего 6. Поэтому обучение стоит C ≈ 6·N·D флопов для N параметров и D токенов."
                    }
                },
                {
                    type: "info", icon: "⚖️", mono: true,
                    en: {
                        title: "Split the compute budget",
                        text: [
                            "For a fixed **compute budget** C ≈ 6·N·D, a bigger model sees fewer tokens. A 2022 study that trained hundreds of models looked for the **compute-optimal** split: the N and D that give the lowest loss for a given C.",
                            "It found that as C grows, N and D should grow in equal proportion, both roughly as √C, with about 20 training tokens per parameter for its data and models. With D = 20·N:"
                        ],
                        example: ["C = 6·N·20·N = 120·N²", "C = 1.2·10²² FLOPs → N² = 1.2·10²² / 120 = 10²⁰", "N = 10¹⁰ (10 billion parameters), D = 2·10¹¹ (200 billion tokens)"],
                        note: "Earlier advice, from 2020, had been to grow the model much faster than the data, so by this measure many large models of that time were trained on too few tokens."
                    },
                    ru: {
                        title: "Как распределить вычислительный бюджет",
                        text: [
                            "При фиксированном **вычислительном бюджете** (compute budget) C ≈ 6·N·D чем больше модель, тем меньше токенов она увидит. В исследовании 2022 года, где обучили сотни моделей, искали **оптимальное по вычислениям** (compute-optimal) распределение бюджета: такие N и D, при которых функция потерь для данного C наименьшая.",
                            "Оказалось, что с ростом C величины N и D должны расти в равной пропорции, обе примерно как √C, и на каждый параметр должно приходиться около 20 обучающих токенов — для данных и моделей этого исследования. При D = 20·N:"
                        ],
                        example: ["C = 6·N·20·N = 120·N²", "C = 1,2·10²² флопов → N² = 1,2·10²² / 120 = 10²⁰", "N = 10¹⁰ (10 миллиардов параметров), D = 2·10¹¹ (200 миллиардов токенов)"],
                        note: "Раньше, в 2020 году, советовали наращивать модель гораздо быстрее, чем данные, поэтому по этой мерке многие крупные модели того времени обучались на слишком малом числе токенов."
                    }
                },
                {
                    type: "choice", card: "r2c",
                    en: {
                        q: "A compute budget C grows 100 times. Under the compute-optimal rule (parameters N and training tokens D grow in equal proportion, with C ≈ 6·N·D), how should N and D change?",
                        options: ["Both about 10 times larger: √100 = 10, so the ratio D/N stays the same", "N 100 times larger, D unchanged: bigger models learn more from each token", "D 100 times larger, N unchanged: data is cheaper to add than parameters", "N 50 times and D 2 times larger: the product N·D still grows 100 times"],
                        hint: "If N and D both grow k times, how many times does N·D grow?",
                        why: "C ∝ N·D: if N and D both grow k times, C grows k² times, and k² = 100 gives k = √100 = 10, so D/N stays the same. Growing N 50 times and D 2 times also multiplies C by 100, but leaves the model far too large for its data."
                    },
                    ru: {
                        q: "Вычислительный бюджет C вырос в 100 раз. Как изменить N и D, если следовать правилу оптимальности по вычислениям: число параметров N и число обучающих токенов D растут в равной пропорции, а C ≈ 6·N·D?",
                        options: ["Увеличить оба примерно в 10 раз: √100 = 10, и отношение D/N не меняется", "Увеличить N в 100 раз, D не менять: большие модели извлекают больше из каждого токена", "Увеличить D в 100 раз, N не менять: добавлять данные дешевле, чем параметры", "Увеличить N в 50 раз, а D — в 2 раза: произведение N·D всё равно вырастет в 100 раз"],
                        hint: "Если и N, и D вырастут в k раз, во сколько раз вырастет N·D?",
                        why: "C ∝ N·D: если и N, и D растут в k раз, то C растёт в k² раз; из k² = 100 получаем k = √100 = 10, и отношение D/N сохраняется. Если же увеличить N в 50 раз, а D — в 2 раза, C тоже вырастет в 100 раз, но модель окажется намного больше, чем нужно для её данных."
                    }
                },
                {
                    type: "info", icon: "🏭",
                    en: {
                        title: "Serving changes the maths",
                        text: [
                            "After training comes **inference**: running the trained model to answer requests. Every token it reads or generates costs about 2·N FLOPs: a forward pass only. A model that serves requests for months may process far more tokens than it was trained on.",
                            "This is one reason why many recent models are trained on far more than 20 tokens per parameter. A smaller model trained longer needs more training compute to reach the same loss, but less compute for every token it later serves."
                        ]
                    },
                    ru: {
                        title: "Инференс меняет арифметику",
                        text: [
                            "После обучения начинается **инференс** (inference): модель отвечает на запросы. Каждый токен, который она читает или генерирует, стоит около 2·N флопов: только прямой проход. Модель, которая месяцами обслуживает запросы, может обработать гораздо больше токенов, чем видела при обучении.",
                            "Это одна из причин, почему многие недавние модели обучают на гораздо большем числе токенов, чем 20 на параметр. Модели поменьше, обученной дольше, нужно больше вычислений на обучение, чтобы достичь того же значения функции потерь, зато меньше — на каждый токен, который она потом обработает."
                        ]
                    }
                },
                {
                    type: "number", answer: 3, card: "r2d",
                    en: {
                        q: "Training a model with N parameters on D tokens costs about 6·N·D FLOPs, and generating one token costs about 2·N. After generating how many tokens, as a multiple of D, has inference used as much compute as training?",
                        hint: "Call the number of generated tokens T, write 2·N·T = 6·N·D and solve for T.",
                        why: "For T generated tokens, 2·N·T = 6·N·D gives T = 6·N·D / (2·N) = 3·D. A widely used model can pass that point, and then over its life inference costs more compute than training did."
                    },
                    ru: {
                        q: "Обучение модели с N параметрами на D токенах стоит около 6·N·D FLOP, а генерация одного токена — около 2·N. Сколько токенов (в единицах D) надо сгенерировать, чтобы на инференс ушло столько же вычислений, сколько на обучение?",
                        hint: "Обозначь число сгенерированных токенов T, запиши 2·N·T = 6·N·D и вырази T.",
                        why: "Пусть T — число сгенерированных токенов. Из 2·N·T = 6·N·D получаем T = 6·N·D / (2·N) = 3·D. Широко используемая модель может перейти этот рубеж, и тогда за всё время её работы инференс потребует больше вычислений, чем обучение."
                    }
                },
                {
                    type: "info", icon: "🎢", mono: true,
                    en: {
                        title: "Smooth loss, sudden skills?",
                        text: [
                            "Some abilities seem to appear suddenly at a certain scale: this is called **emergence**. Part of the effect can come from the metric. **Exact match** gives credit only when every token of an answer is right.",
                            "If each of 10 tokens is right with probability p, independently, the whole answer is right with probability p¹⁰. A steady rise of p can then look like a sudden jump:"
                        ],
                        example: ["p = 0.7 → p¹⁰ ≈ 0.03", "p = 0.99 → p¹⁰ ≈ 0.90"],
                        note: "This does not explain every jump. But a continuous metric, such as the log-probability of the right answer, often rises steadily where exact match jumps sharply."
                    },
                    ru: {
                        title: "Плавный спад потерь, внезапные навыки?",
                        text: [
                            "Некоторые способности как будто внезапно появляются при определённом масштабе: это называют **эмерджентностью** (emergence). Отчасти эффект может создавать сама метрика. **Точное совпадение** (exact match) засчитывает ответ, только если верен каждый его токен.",
                            "Если каждый из 10 токенов верен с вероятностью p независимо от остальных, то весь ответ верен с вероятностью p¹⁰. Тогда плавный рост p может выглядеть как внезапный скачок:"
                        ],
                        example: ["p = 0,7 → p¹⁰ ≈ 0,03", "p = 0,99 → p¹⁰ ≈ 0,90"],
                        note: "Это объясняет не каждый скачок. Но непрерывная метрика, например логарифм вероятности правильного ответа (log-probability), часто растёт плавно там, где точное совпадение резко подскакивает."
                    }
                },
                {
                    type: "number", answer: 0.35, tolerance: 0.005, share: true,
                    en: {
                        q: "An answer is scored by exact match: all 10 of its tokens must be right. Each token is right with probability 0.9, independently. What share of answers is fully right? Round to two decimal places.",
                        hint: "Raise 0.9 to the power 10; 0.9² = 0.81 helps.",
                        why: "0.9² = 0.81, 0.9⁴ = 0.81² = 0.6561, 0.9⁸ = 0.6561² ≈ 0.4305, and 0.9¹⁰ = 0.9⁸·0.9² ≈ 0.4305·0.81 ≈ 0.349: about 0.35. As p rises steadily from 0.7 to 0.99, exact match jumps from 0.03 to 0.90."
                    },
                    ru: {
                        q: "Ответ проверяют по точному совпадению: верными должны быть все 10 его токенов. Каждый токен верен с вероятностью 0,9 независимо от остальных. Какая доля ответов окажется полностью верной? Округли до сотых.",
                        hint: "Возведи 0,9 в десятую степень; пригодится 0,9² = 0,81.",
                        why: "0,9² = 0,81; 0,9⁴ = 0,81² = 0,6561; 0,9⁸ = 0,6561² ≈ 0,4305; 0,9¹⁰ = 0,9⁸·0,9² ≈ 0,4305·0,81 ≈ 0,349, то есть около 0,35. Пока p плавно растёт от 0,7 до 0,99, точное совпадение подскакивает с 0,03 до 0,90."
                    }
                },
                {
                    type: "choice",
                    en: {
                        q: "Which statement about scaling laws would a careful reviewer accept?",
                        options: ["They are fits to measured training runs: reliable in the measured range, less reliable far beyond it", "With enough runs fitted, they guarantee that a given skill appears at a known model size", "They show the loss approaching zero, as long as compute and data keep growing", "Their exponents, once measured on one dataset, hold for every architecture and dataset"],
                        hint: "Recall the term E, and ask what exactly the fits predict.",
                        why: "Scaling laws are empirical fits. Widely used fits include an irreducible term E > 0; their constants, exponents included, depend on the data and the architecture; and they predict the loss, not specific skills. Far beyond the measured range, an extrapolation is a hypothesis to test."
                    },
                    ru: {
                        q: "С каким утверждением о законах масштабирования согласится придирчивый рецензент?",
                        options: ["Это аппроксимации по реальным запускам обучения: надёжны в измеренном диапазоне, далеко за ним — меньше", "При достаточном числе запусков они гарантируют, что заданный навык появится при известном размере модели", "Они показывают, что функция потерь стремится к нулю, пока растут вычисления и данные", "Их показатели степени, измеренные на одном наборе данных, верны для любой архитектуры и любых данных"],
                        hint: "Вспомни про слагаемое E и подумай, что именно предсказывают эти аппроксимации.",
                        why: "Законы масштабирования — эмпирические аппроксимации. В распространённых формах есть неустранимое слагаемое E > 0; их константы, включая показатели степени, зависят от данных и архитектуры; предсказывают они функцию потерь, а не отдельные навыки. Экстраполяция далеко за измеренный диапазон — гипотеза, которую нужно проверять."
                    }
                },
                {
                    type: "recap",
                    en: {
                        points: [
                            "Empirically, the test loss falls as a power law in N, D and C, down to an irreducible E: `L = E + A/N^α + B/D^β`. With α = 1/3, halving A/N^α takes 8 times the parameters.",
                            "Training a dense transformer costs `C ≈ 6·N·D` FLOPs: about 2 per parameter per token in the forward pass, 4 in the backward pass.",
                            "A 2022 study found that as the compute budget grows, the compute-optimal N and D grow together, at about 20 tokens per parameter. Inference costs about 2·N FLOPs per token, so heavy use favours smaller models trained longer.",
                            "Sharp metrics like exact match can turn smooth gains into apparent jumps, and scaling-law fits are trustworthy mainly within the range of the runs they were fitted to."
                        ]
                    },
                    ru: {
                        points: [
                            "Эмпирически функция потерь на тестовых данных убывает с ростом N, D и C по степенному закону, приближаясь к неустранимой ошибке E: `L = E + A/N^α + B/D^β`. При α = 1/3, чтобы уменьшить A/N^α вдвое, нужно в 8 раз больше параметров.",
                            "Обучение плотного трансформера стоит `C ≈ 6·N·D` флопов: около 2 на параметр и токен в прямом проходе и 4 — в обратном.",
                            "По данным исследования 2022 года, с ростом вычислительного бюджета оптимальные по вычислениям N и D растут вместе, и на каждый параметр приходится около 20 токенов. Инференс стоит около 2·N флопов на токен, поэтому при большой нагрузке выгоднее модели поменьше, обученные дольше.",
                            "Строгие метрики вроде точного совпадения могут превращать плавный рост в кажущиеся скачки, а аппроксимациям законов масштабирования можно доверять прежде всего в диапазоне тех запусков, по которым их подбирали."
                        ]
                    }
                }
            ]
        },

        /* ----- r3. Optimisers for large models ----- */
        r3: {
            steps: [
                {
                    type: "info", icon: "🧭", mono: true,
                    en: {
                        title: "Momentum: an average of past gradients",
                        text: [
                            "Plain SGD uses only the gradient of the current batch, which is noisy when batches are small. **Momentum** uses an **exponential moving average** of the gradients instead: each step mixes the new gradient g into a running average m.",
                            "Gradient components that flip sign from step to step (noise, a zigzag across a narrow valley) partly cancel in the average, while consistent ones remain. The coefficients of older gradients shrink geometrically:"
                        ],
                        example: ["m ← β·m + (1 − β)·g, with 0 ≤ β < 1", "w ← w − η·m", "coefficient of the gradient from k steps ago: (1 − β)·β^k", "the coefficients add up to (1 − β)·(1 + β + β² + …) = 1", "memory ≈ 1/(1 − β) steps: β = 0.9 → about 10"],
                        note: "Why 1/(1 − β): the newest gradient gets the coefficient 1 − β, as in a plain average of the last 1/(1 − β) gradients. Many libraries write momentum as m ← β·m + g: that m is 1/(1 − β) times longer, the same as an η that is 1/(1 − β) times larger."
                    },
                    ru: {
                        title: "Импульс: среднее прошлых градиентов",
                        text: [
                            "Обычный SGD использует только градиент текущего батча, а при маленьких батчах этот градиент шумный. **Метод импульса** (momentum) вместо него берёт **экспоненциальное скользящее среднее** (exponential moving average) градиентов: на каждом шаге новый градиент g подмешивается к накопленному среднему m.",
                            "Компоненты градиента, которые меняют знак от шага к шагу (шум, зигзаги поперёк узкой долины), при усреднении частично гасят друг друга, а устойчивые сохраняются. Коэффициенты при старых градиентах убывают в геометрической прогрессии:"
                        ],
                        example: ["m ← β·m + (1 − β)·g, где 0 ≤ β < 1", "w ← w − η·m", "коэффициент при градиенте k шагов назад: (1 − β)·β^k", "сумма коэффициентов: (1 − β)·(1 + β + β² + …) = 1", "память ≈ 1/(1 − β) шагов: β = 0,9 → около 10"],
                        note: "Откуда 1/(1 − β): самый свежий градиент получает коэффициент 1 − β, как в обычном среднем последних 1/(1 − β) градиентов. Во многих библиотеках импульс записывают как m ← β·m + g: такое m в 1/(1 − β) раз длиннее, а это то же самое, что увеличить η в 1/(1 − β) раз."
                    }
                },
                {
                    type: "number", answer: 1000, card: "r3a",
                    en: {
                        q: "An exponential moving average of the gradients, m ← β·m + (1 − β)·g, uses β = 0.999. Roughly how many of the most recent steps does it effectively average over?",
                        hint: "Such an average remembers about 1/(1 − β) steps: about 10 for β = 0.9.",
                        why: "1/(1 − 0.999) = 1/0.001 = 1000 steps: the newest gradient gets the coefficient 0.001, as in a plain average of 1000 gradients. With its common defaults, Adam averages the squared gradients with β₂ = 0.999, over about 1000 steps, and the gradients themselves with β₁ = 0.9, over about 10."
                    },
                    ru: {
                        q: "Экспоненциальное скользящее среднее градиентов m ← β·m + (1 − β)·g считают с β = 0,999. Примерно по скольким последним шагам оно фактически усредняет?",
                        hint: "Такое среднее помнит примерно 1/(1 − β) шагов: при β = 0,9 — около 10.",
                        why: "1/(1 − 0,999) = 1/0,001 = 1000 шагов: самый свежий градиент получает коэффициент 0,001, как в обычном среднем 1000 градиентов. При стандартных настройках Adam усредняет квадраты градиентов с β₂ = 0,999 — примерно по 1000 шагам, а сами градиенты с β₁ = 0,9 — примерно по 10."
                    }
                },
                {
                    type: "info", icon: "⚙️", mono: true,
                    en: {
                        title: "Adam: a step size for every weight",
                        text: [
                            "**Adam** keeps two moving averages for every weight: m of its gradients and v of their squares (estimates of the first and second moments). Both start at 0, so early on both are biased towards 0: after t steps their coefficients add up to only 1 − β₁^t and 1 − β₂^t.",
                            "Dividing by these sums, the **bias correction**, removes the bias. The update divides m̂ by √v̂, so every weight gets its own effective learning rate η/(√v̂ + ε). All operations act on each weight separately."
                        ],
                        example: ["m ← β₁·m + (1 − β₁)·g", "v ← β₂·v + (1 − β₂)·g²", "m̂ = m / (1 − β₁^t), v̂ = v / (1 − β₂^t), t = 1, 2, …", "w ← w − η·m̂ / (√v̂ + ε)"],
                        note: "Common defaults: β₁ = 0.9 and β₂ = 0.999 (large models often use a smaller β₂, with a shorter memory). ε is a tiny constant that keeps the division safe when v̂ is near 0."
                    },
                    ru: {
                        title: "Adam: свой размер шага для каждого веса",
                        text: [
                            "**Adam** хранит для каждого веса два скользящих средних: m — его градиентов, v — их квадратов (это оценки первого и второго моментов). Оба инициализируются нулём, поэтому поначалу смещены к нулю: после t шагов их коэффициенты в сумме дают лишь 1 − β₁^t и 1 − β₂^t.",
                            "Деление на эти суммы — **поправка на смещение** (bias correction) — убирает смещение. В обновлении m̂ делится на √v̂, так что у каждого веса своя эффективная скорость обучения η/(√v̂ + ε). Все операции выполняются для каждого веса отдельно."
                        ],
                        example: ["m ← β₁·m + (1 − β₁)·g", "v ← β₂·v + (1 − β₂)·g²", "m̂ = m / (1 − β₁^t), v̂ = v / (1 − β₂^t), t = 1, 2, …", "w ← w − η·m̂ / (√v̂ + ε)"],
                        note: "Обычно по умолчанию β₁ = 0,9 и β₂ = 0,999 (для больших моделей β₂ часто берут меньше, и память становится короче). ε — крошечная константа, которая делает деление численно устойчивым, когда v̂ близко к 0."
                    }
                },
                {
                    type: "number", answer: 0.001, tolerance: 0.00005, card: "r3b",
                    en: {
                        q: "Adam with bias correction makes its first step: t = 1, m and v start at 0, ε is negligible. One weight has the gradient g = 250, and the learning rate is η = 0.001. What is the size |Δw| of that weight's update?",
                        hint: "At t = 1, what are m̂ and v̂ in terms of g?",
                        why: "At t = 1, m = (1 − β₁)·g and v = (1 − β₂)·g², so m̂ = m/(1 − β₁) = g and v̂ = v/(1 − β₂) = g². The update is Δw = −η·g/√(g²) = −η·g/|g|, of size η = 0.001 for g = 250 just as for g = 0.0025. Without the correction, with β₁ = 0.9 and β₂ = 0.999, its size would be η·0.1·|g|/(√0.001·|g|) = √10·η ≈ 3.16·η."
                    },
                    ru: {
                        q: "Adam с поправкой на смещение делает первый шаг: t = 1, m и v инициализированы нулём, ε пренебрежимо мало. Градиент одного веса g = 250, скорость обучения η = 0,001. Чему равен модуль |Δw| обновления этого веса?",
                        hint: "Чему равны m̂ и v̂ при t = 1, если выразить их через g?",
                        why: "На первом шаге m = (1 − β₁)·g и v = (1 − β₂)·g², поэтому m̂ = m/(1 − β₁) = g и v̂ = v/(1 − β₂) = g². Обновление Δw = −η·g/√(g²) = −η·g/|g|, и его модуль равен η = 0,001 — и при g = 250, и при g = 0,0025. Без поправки при β₁ = 0,9 и β₂ = 0,999 модуль был бы η·0,1·|g|/(√0,001·|g|) = √10·η ≈ 3,16·η."
                    }
                },
                {
                    type: "choice",
                    en: {
                        q: "By mistake, the loss is multiplied by 100 from the very first step of training. What happens to the updates of Adam and of plain SGD?",
                        options: ["Adam's hardly change, as m̂ and √v̂ both grow 100 times; SGD's grow 100 times", "Both grow 100 times, because every gradient is now 100 times larger", "Adam's shrink 100 times, because v grows 100² times; SGD's stay the same", "Neither changes, because the minimum of the loss stays in the same place"],
                        hint: "Which quantities in Adam's update grow with the gradient, and by how much?",
                        why: "In Adam, m̂ grows 100 times, v̂ 100² times and so √v̂ 100 times: m̂/(√v̂ + ε) becomes 100·m̂/(100·√v̂ + ε), the same apart from the tiny ε. SGD multiplies the gradient by η directly, so its steps grow 100 times. The minimum does stay in the same place, but SGD's path to it changes."
                    },
                    ru: {
                        q: "По ошибке функцию потерь умножили на 100 с самого первого шага обучения. Что станет с обновлениями Adam и обычного SGD?",
                        options: ["У Adam они почти не изменятся: и m̂, и √v̂ вырастут в 100 раз; у SGD вырастут в 100 раз", "У обоих они вырастут в 100 раз, ведь каждый градиент стал в 100 раз больше", "У Adam они уменьшатся в 100 раз, ведь v вырастет в 100² раз; у SGD не изменятся", "Не изменятся ни у того, ни у другого: минимум функции потерь остаётся на месте"],
                        hint: "Какие величины в обновлении Adam растут вместе с градиентом и во сколько раз?",
                        why: "В Adam m̂ растёт в 100 раз, v̂ — в 100² раз, а значит, √v̂ — в 100 раз: m̂/(√v̂ + ε) превращается в 100·m̂/(100·√v̂ + ε) и с точностью до крошечного ε не меняется. SGD умножает градиент на η напрямую, поэтому его шаги вырастают в 100 раз. Минимум действительно остаётся на месте, но путь SGD к нему меняется."
                    }
                },
                {
                    type: "info", icon: "🧽", mono: true,
                    en: {
                        title: "AdamW: weight decay outside the adaptive step",
                        text: [
                            "An L2 penalty (λ/2)·‖w‖² adds λ·w to the gradient. With plain SGD that is exactly weight decay. Inside Adam it is not: λ·w passes through m̂ and is divided by √v̂ like the rest of the gradient, so the strength of the decay differs from weight to weight.",
                            "**AdamW** takes the decay out of the adaptive step and applies it directly: **decoupled weight decay**. At each step, it multiplies every weight by the same factor 1 − η·λ and adds the usual Adam update. AdamW is a common default for training large models."
                        ],
                        example: ["Adam + L2: the Adam step on g + λ·w", "AdamW: m̂ and v̂ from g alone, and", "w ← w − η·(m̂ / (√v̂ + ε) + λ·w)"]
                    },
                    ru: {
                        title: "AdamW: затухание весов вне адаптивного шага",
                        text: [
                            "L2-штраф (λ/2)·‖w‖² добавляет к градиенту λ·w. При обычном SGD это в точности затухание весов (weight decay). В Adam — нет: λ·w проходит через m̂ и делится на √v̂, как и остальной градиент, поэтому сила затухания у разных весов разная.",
                            "**AdamW** выносит затухание из адаптивного шага и применяет его напрямую: это **раздельное затухание весов** (decoupled weight decay). На каждом шаге он умножает все веса на один и тот же множитель 1 − η·λ и прибавляет обычное обновление Adam. AdamW — распространённый выбор по умолчанию для обучения больших моделей."
                        ],
                        example: ["Adam + L2: шаг Adam по g + λ·w", "AdamW: m̂ и v̂ только по g, и", "w ← w − η·(m̂ / (√v̂ + ε) + λ·w)"]
                    }
                },
                {
                    type: "choice", card: "r3c",
                    en: {
                        q: "Adam is used with an L2 penalty (λ/2)·‖w‖² added to the loss, instead of AdamW's decoupled weight decay. Which weights does the penalty pull towards zero the least, relative to their size?",
                        options: ["Weights with large past gradients: their large √v̂ also divides the penalty's gradient λ·w", "Weights with small past gradients: Adam takes its smallest steps where √v̂ is small", "All weights equally: λ is the same for every weight, so the pull is the same too", "None of them: Adam's step follows only the sign of the gradient, not its size"],
                        hint: "Through which parts of Adam's update does the penalty's gradient λ·w pass?",
                        why: "λ·w joins the gradient, so it passes through m̂ and is divided by √v̂: large past gradients mean a large √v̂ and the weakest pull, small ones the strongest. λ is the same for every weight, but the division by √v̂ is not. In general Adam's step is not a pure sign: its size depends on m̂/√v̂, and λ·w is part of m̂."
                    },
                    ru: {
                        q: "Adam используют с L2-штрафом (λ/2)·‖w‖², добавленным к функции потерь, а не с раздельным затуханием весов, как в AdamW. Какие веса этот штраф тянет к нулю слабее всего относительно их величины?",
                        options: ["Веса с большими прошлыми градиентами: градиент штрафа λ·w у них тоже делится на большое √v̂", "Веса с малыми прошлыми градиентами: там, где √v̂ мало, Adam делает самые мелкие шаги", "Все веса одинаково: коэффициент λ у всех один и тот же, значит, и тяга к нулю одинакова", "Никакие: шаг Adam зависит только от знака градиента, а не от его величины"],
                        hint: "Через какие части обновления Adam проходит градиент штрафа λ·w?",
                        why: "λ·w входит в градиент, поэтому проходит через m̂ и делится на √v̂: большие прошлые градиенты дают большое √v̂ и самую слабую тягу к нулю, малые — самую сильную. Коэффициент λ у всех весов один, а делитель √v̂ у каждого свой. В общем случае шаг Adam не сводится к знаку: его величина зависит от m̂/√v̂, а λ·w входит в m̂."
                    }
                },
                {
                    type: "info", icon: "🧯", mono: true,
                    en: {
                        title: "Keeping training stable",
                        text: [
                            "**Warmup**: over the first steps, the learning rate rises from about 0 to its peak, often linearly. Then it usually decays, often along a cosine: a **cosine schedule**.",
                            "**Gradient clipping** by the global norm ‖g‖, the length of all the model's gradients taken as one vector: if ‖g‖ exceeds a threshold c, the whole gradient is scaled down to length c. The direction stays and only the length changes, so a rare huge gradient has a bounded effect on the step and on Adam's averages."
                        ],
                        example: ["if ‖g‖ > c: g ← g · c / ‖g‖"],
                        note: "Why warmup helps is still studied. One explanation: early on, v̂ rests on few gradients, so Adam's step sizes are unreliable, and steps that are too large can make the loss diverge."
                    },
                    ru: {
                        title: "Как сделать обучение устойчивым",
                        text: [
                            "**Разогрев скорости обучения** (warmup): на первых шагах она растёт почти от нуля до пикового значения, часто линейно. Потом она обычно убывает, часто по косинусу: это **косинусное расписание** (cosine schedule).",
                            "**Обрезка градиента по норме** (gradient clipping): если глобальная норма ‖g‖ (длина всех градиентов модели, собранных в один вектор) больше порога c, весь градиент уменьшают до длины c. Направление сохраняется, меняется только длина, так что влияние редкого огромного градиента на шаг и на средние Adam ограничено."
                        ],
                        example: ["если ‖g‖ > c: g ← g · c / ‖g‖"],
                        note: "Почему разогрев помогает, до сих пор изучают. Одно из объяснений: поначалу v̂ опирается всего на несколько градиентов, поэтому размеры шагов Adam ненадёжны, а от слишком больших шагов функция потерь может разойтись."
                    }
                },
                {
                    type: "number", answer: 0.6, tolerance: 0.005,
                    en: {
                        q: "A model's whole gradient is g = (3, 4). It is clipped by its global norm with the threshold c = 1. What is its first component after clipping?",
                        hint: "First find ‖g‖ and compare it with c.",
                        why: "‖g‖ = √(3² + 4²) = √(9 + 16) = 5 > 1, so g ← g · 1/5 = (0.6, 0.8): the same direction, length 1. Clipping each component to [−1, 1] separately would give (1, 1): a different direction."
                    },
                    ru: {
                        q: "Весь градиент модели — g = (3; 4). Его обрезают по глобальной норме с порогом c = 1. Чему равна его первая компонента после обрезки?",
                        hint: "Сначала найди ‖g‖ и сравни её с c.",
                        why: "‖g‖ = √(3² + 4²) = √(9 + 16) = 5 > 1, поэтому g ← g · 1/5 = (0,6; 0,8): направление то же, длина 1. Если бы каждую компоненту по отдельности обрезали до отрезка [−1; 1], получилось бы (1; 1) — другое направление."
                    }
                },
                {
                    type: "info", icon: "💾",
                    en: {
                        title: "Memory: about 16 bytes per parameter",
                        text: [
                            "**Mixed-precision** training runs most of the forward and backward passes in 16-bit numbers, but applies the update to a 32-bit **master copy** of the weights: many updates are too small to change a 16-bit number.",
                            "Adam's averages m and v, its **optimiser state**, are usually kept in 32 bits too. A common setup stores per parameter:"
                        ],
                        table: { side: true, head: ["", "Bytes per parameter"], rows: [["Weights, 16-bit", "2"], ["Gradients, 16-bit", "2"], ["Master copy of the weights, 32-bit", "4"], ["Adam's m, 32-bit", "4"], ["Adam's v, 32-bit", "4"], ["Total", "16"]] },
                        note: "The activations saved for the backward pass need extra memory, which grows with the batch size and the context length. **Sharding** splits weights, gradients and optimiser state across devices: over 8 devices, each holds an eighth."
                    },
                    ru: {
                        title: "Память: около 16 байт на параметр",
                        text: [
                            "При обучении со **смешанной точностью** (mixed precision) прямой и обратный проходы в основном идут в 16-битных числах, а обновление применяется к 32-битной **мастер-копии** весов (master copy): многие обновления слишком малы, чтобы изменить 16-битное число.",
                            "Средние m и v в Adam называют **состоянием оптимизатора** (optimizer state); их обычно тоже хранят в 32 битах. В распространённой схеме на каждый параметр приходится:"
                        ],
                        table: { side: true, head: ["", "Байт на параметр"], rows: [["Веса, 16 бит", "2"], ["Градиенты, 16 бит", "2"], ["Мастер-копия весов, 32 бита", "4"], ["m в Adam, 32 бита", "4"], ["v в Adam, 32 бита", "4"], ["Итого", "16"]] },
                        note: "Под активации, сохранённые для обратного прохода, нужна дополнительная память: она растёт с размером батча и длиной контекста. **Шардирование** (sharding) делит веса, градиенты и состояние оптимизатора между устройствами: на 8 устройствах каждое хранит восьмую часть."
                    }
                },
                {
                    type: "number", answer: 48, card: "r3d",
                    en: {
                        q: "Mixed-precision training with Adam needs about 16 bytes per parameter: 16-bit weights and gradients, plus a 32-bit master copy, m and v. How many GB (10⁹ bytes) is that for 3 billion parameters, not counting activations?",
                        hint: "Multiply the number of parameters by the bytes per parameter.",
                        why: "3·10⁹ · 16 bytes = 48·10⁹ bytes = 48 GB, before activations. Sharded evenly over 8 devices, that is 48/8 = 6 GB on each."
                    },
                    ru: {
                        q: "Обучение с Adam в смешанной точности требует около 16 байт на параметр: веса и градиенты в 16 битах, мастер-копия весов, m и v — в 32 битах. Сколько это ГБ (10⁹ байт) для 3 миллиардов параметров без учёта активаций?",
                        hint: "Умножь число параметров на число байт на параметр.",
                        why: "3·10⁹ · 16 байт = 48·10⁹ байт = 48 ГБ — и это ещё без активаций. При равномерном шардировании на 8 устройств получается 48/8 = 6 ГБ на каждом."
                    }
                },
                {
                    type: "recap",
                    en: {
                        points: [
                            "An exponential moving average `m ← β·m + (1 − β)·g` remembers about 1/(1 − β) steps: about 10 for β = 0.9, about 1000 for β = 0.999.",
                            "Adam divides a bias-corrected average of the gradients, m̂, by the root of a bias-corrected average of their squares, √v̂. So, ignoring ε, its first step moves each weight with a nonzero gradient by η, and a positive constant factor on the loss cancels.",
                            "AdamW applies weight decay directly: `w ← w − η·(m̂ / (√v̂ + ε) + λ·w)`. An L2 penalty inside Adam is divided by √v̂ instead, so it is weakest for weights with large past gradients.",
                            "Warmup and clipping by the global norm help keep training stable. Mixed-precision training with Adam needs about 16 bytes per parameter, before activations."
                        ]
                    },
                    ru: {
                        points: [
                            "Экспоненциальное скользящее среднее `m ← β·m + (1 − β)·g` помнит около 1/(1 − β) шагов: около 10 при β = 0,9 и около 1000 при β = 0,999.",
                            "Adam делит среднее градиентов m̂ на корень из среднего их квадратов √v̂; оба средних — с поправкой на смещение. Поэтому, если пренебречь ε, первый шаг сдвигает каждый вес с ненулевым градиентом на η, а постоянный положительный множитель при функции потерь сокращается.",
                            "AdamW применяет затухание весов напрямую: `w ← w − η·(m̂ / (√v̂ + ε) + λ·w)`. L2-штраф внутри Adam, наоборот, делится на √v̂ и поэтому слабее всего действует на веса с большими прошлыми градиентами.",
                            "Разогрев и обрезка градиента по глобальной норме помогают стабилизировать обучение. Обучение с Adam в смешанной точности требует около 16 байт на параметр, не считая активаций."
                        ]
                    }
                }
            ]
        },

        /* ----- r4. Why giant networks generalise ----- */
        r4: {
            steps: [
                {
                    type: "info", icon: "🧩",
                    en: {
                        title: "A puzzle about capacity",
                        text: [
                            "Classical learning theory ties overfitting to **capacity**: how many different labellings of the data a model class can fit. Its upper bounds on the test error loosen as capacity grows. Hence the familiar warning: with too many parameters, a model memorises its data, noise included.",
                            "A 2017 study took standard image-classification networks and their usual training images, but replaced the labels with random ones. The networks still reached zero training error. With the real labels, the same networks generalise well.",
                            "So neither capacity nor a parameter count can explain why these networks generalise: the same network fits real and random labels alike. Something else decides which of the many perfect fits training finds. What that is remains partly open."
                        ]
                    },
                    ru: {
                        title: "Загадка ёмкости",
                        text: [
                            "Классическая теория обучения связывает переобучение (overfitting) с **ёмкостью модели** (capacity): тем, сколько разных разметок данных может подогнать класс моделей. Её верхние оценки ошибки на тесте с ростом ёмкости слабеют. Отсюда и знакомое предостережение: при избытке параметров модель заучивает данные вместе с шумом.",
                            "В исследовании 2017 года стандартные сети для классификации изображений обучали на обычном для них наборе картинок, но метки заменили случайными. Сети всё равно достигли нулевой ошибки на обучении. А с настоящими метками те же сети хорошо работают и на новых данных.",
                            "Значит, ни ёмкость, ни число параметров не объясняют обобщающую способность (generalisation) этих сетей: одна и та же сеть подгоняет и настоящие метки, и случайные. Какую из множества идеальных подгонок найдёт обучение, решает что-то другое. Что именно — вопрос пока отчасти открытый."
                        ]
                    }
                },
                {
                    type: "choice", card: "r4a",
                    en: {
                        q: "A network generalises well when trained on real labels. With the labels of its training images replaced by random ones, it still reaches 100% training accuracy. What does this show?",
                        options: ["It can memorise any labels, so its good test results with real labels cannot come from limited capacity", "It will predict the random labels of new images well too, since it fitted its training labels perfectly", "The images must hold patterns that predict the random labels, or it could not fit them", "The training code must have a bug, since no network can fit truly random labels"],
                        hint: "Could any model predict the random labels of images it has never seen?",
                        why: "Random labels carry no information about new images, so on them the network does no better than chance: it has memorised. Since the same network can memorise any labels, its success with real labels must come from the data, the architecture and the training algorithm, not from having too few parameters."
                    },
                    ru: {
                        q: "С настоящими метками сеть хорошо обобщает. Если же метки её обучающих картинок заменить случайными, она всё равно отвечает верно на 100% обучающих примеров. О чём это говорит?",
                        options: ["Она может заучить любые метки, так что её успех с настоящими метками не объяснить малой ёмкостью", "Случайные метки новых картинок она тоже будет предсказывать хорошо, ведь обучающие она подогнала идеально", "В картинках должны быть закономерности, которые предсказывают случайные метки, иначе их не подогнать", "В коде обучения наверняка ошибка: ни одна сеть не может подогнать по-настоящему случайные метки"],
                        hint: "Может ли хоть какая-нибудь модель предсказать случайные метки картинок, которых она не видела?",
                        why: "Случайные метки ничего не говорят о новых картинках, поэтому на них сеть отвечает не лучше случайного угадывания: она просто заучила примеры. Раз одна и та же сеть может заучить любые метки, её успех с настоящими метками объясняют данные, архитектура и алгоритм обучения, а не нехватка параметров."
                    }
                },
                {
                    type: "info", icon: "📉",
                    en: {
                        title: "Double descent",
                        text: [
                            "Grow a model and watch its test error. The classical U-curve says: it falls, then rises as the model starts to overfit.",
                            "But the error can peak near the **interpolation threshold**, the smallest size that can fit every training example exactly, and then fall again, often below the earlier minimum. This is **double descent**.",
                            "The peak is strongest with noisy labels and little regularisation; well-tuned regularisation can flatten it. A similar shape can appear over training time, and as the number of training examples grows, so more data can sometimes hurt."
                        ]
                    },
                    ru: {
                        title: "Двойной спуск",
                        text: [
                            "Будем увеличивать модель и следить за ошибкой на тесте. Классическая картина — U-образная кривая: ошибка сначала падает, а потом растёт, потому что модель начинает переобучаться.",
                            "Но ошибка может достичь пика у **порога интерполяции** (interpolation threshold) — наименьшего размера, при котором модель способна точно подогнать каждый обучающий пример, — и затем снова упасть, часто ниже прежнего минимума. Это **двойной спуск** (double descent).",
                            "Сильнее всего пик выражен при зашумлённых метках и слабой регуляризации; хорошо подобранная регуляризация может его сгладить. Похожая кривая может получиться и по ходу обучения, и при росте числа обучающих примеров, так что добавление данных иногда даже вредит."
                        ]
                    }
                },
                {
                    type: "match",
                    en: {
                        q: "Match each region of double descent with what happens there.",
                        pairs: [
                            ["Far below the threshold", "Too small to fit the training data: training and test error are both high"],
                            ["Near the threshold", "Barely able to fit the data, with extreme weights that follow every noisy label: test error peaks"],
                            ["Far above the threshold", "Many exact fits exist, and training tends to find a smooth, low-norm one: test error falls again"]
                        ],
                        why: "Near the threshold an exact fit is barely possible, so only one with extreme weights reaches every noisy label, and it swings wildly between the training points. Far above it, many exact fits exist, and what matters is which one training picks: the next screens show how."
                    },
                    ru: {
                        q: "Сопоставь каждую область двойного спуска с тем, что в ней происходит.",
                        pairs: [
                            ["Намного ниже порога", "Модель слишком мала, чтобы подогнать обучающие данные: ошибка высока и на обучении, и на тесте"],
                            ["Около порога", "Подогнать данные едва удаётся, и лишь огромными весами под каждую зашумлённую метку: пик ошибки на тесте"],
                            ["Намного выше порога", "Точных подгонок много, и обучение обычно находит гладкую, с малой нормой: ошибка на тесте снова падает"]
                        ],
                        why: "Около порога точная подгонка едва возможна: дотянуться до каждой зашумлённой метки удаётся только с огромными весами, и функция сильно колеблется между обучающими точками. Намного выше порога точных подгонок много, и важно, какую из них выберет обучение: об этом следующие экраны."
                    }
                },
                {
                    type: "info", icon: "📏", mono: true,
                    en: {
                        title: "Many ways to fit, one is chosen",
                        text: [
                            "When a model has more parameters than training examples and can fit them, it can usually do so in infinitely many ways. All these fits have training loss 0, so the loss cannot tell them apart. Yet training ends at one particular fit.",
                            "The simplest case is a linear model ŷ = w·x with squared loss (w·x − y)² on one training point. Gradient descent from w = 0, with a small enough learning rate, converges to the **minimum-norm solution**: the exact fit with the smallest length ‖w‖."
                        ],
                        example: ["x = (3, 4), y = 25", "every w with 3·w₁ + 4·w₂ = 25 fits: (25/3, 0), (0, 6.25), …", "gradient descent from w = 0 converges to w = y·x / ‖x‖²"],
                        note: "The same holds for least squares with many training points, whenever exact fits exist: gradient descent from 0 converges to the exact fit of minimum norm."
                    },
                    ru: {
                        title: "Точных подгонок много, выбирается одна",
                        text: [
                            "Если у модели больше параметров, чем обучающих примеров, и она способна их подогнать, то способов сделать это обычно бесконечно много. У всех таких подгонок потери на обучении равны 0, так что функция потерь их не различает. И всё же обучение приходит к одной конкретной подгонке.",
                            "Простейший случай — линейная модель ŷ = w·x с квадратичной функцией потерь (w·x − y)² и одной обучающей точкой. Градиентный спуск из w = 0 при достаточно малой скорости обучения сходится к **решению с минимальной нормой** (minimum-norm solution) — точной подгонке с наименьшей длиной ‖w‖."
                        ],
                        example: ["x = (3; 4), y = 25", "подходит любой w, для которого 3·w₁ + 4·w₂ = 25: (25/3; 0), (0; 6,25), …", "градиентный спуск из w = 0 сходится к w = y·x / ‖x‖²"],
                        note: "То же верно и для метода наименьших квадратов со многими обучающими точками, если точные подгонки существуют: градиентный спуск из 0 сходится к точной подгонке с минимальной нормой."
                    }
                },
                {
                    type: "number", answer: 5, card: "r4b",
                    en: {
                        q: "A linear model ŷ = w·x must fit the training point x = (3, 4), y = 25 exactly, so 3·w₁ + 4·w₂ = 25. Of all such weight vectors w = (w₁, w₂), what is the smallest possible length ‖w‖?",
                        hint: "Only the part of w along x = (3, 4) affects w·x.",
                        why: "Write w = c·x + u with u ⊥ x. The fit needs only c·‖x‖² = y, so c = 25/25 = 1, while ‖w‖² = c²·‖x‖² + ‖u‖² grows with ‖u‖. The shortest fit has u = 0: w = (3, 4), of length √(9 + 16) = 5 = |y| / ‖x‖. Other fits are longer: (0, 6.25) has length 6.25, and (25/3, 0) about 8.33."
                    },
                    ru: {
                        q: "Линейная модель ŷ = w·x должна точно подогнать обучающую точку x = (3; 4), y = 25, то есть 3·w₁ + 4·w₂ = 25. Какова наименьшая возможная длина ‖w‖ среди всех таких векторов весов w = (w₁; w₂)?",
                        hint: "На w·x влияет только составляющая w вдоль x = (3; 4).",
                        why: "Запишем w = c·x + u, где u ⊥ x. Для подгонки нужно лишь c·‖x‖² = y, откуда c = 25/25 = 1, а ‖w‖² = c²·‖x‖² + ‖u‖² растёт вместе с ‖u‖. Самая короткая подгонка — при u = 0: w = (3; 4), её длина √(9 + 16) = 5 = |y| / ‖x‖. Остальные подгонки длиннее: у (0; 6,25) длина 6,25, у (25/3; 0) — около 8,33."
                    }
                },
                {
                    type: "choice", card: "r4c",
                    en: {
                        q: "A linear model is trained by gradient descent, with a small enough learning rate, on the loss (w·x − y)² for one point (x, y), starting from w = 0. Why does it converge to the exact fit with the smallest norm ‖w‖?",
                        options: ["Every gradient is a multiple of x, so w stays a multiple of x, and the only such exact fit is the shortest", "Gradient descent quietly adds weight decay at every step, and this shrinks the weights", "The loss is lower at the shortest exact fit than at the others, so descent heads for it", "Short weight vectors get larger gradients than long ones, so descent drifts towards them"],
                        hint: "In which direction does the gradient of (w·x − y)² with respect to w point?",
                        why: "The gradient 2·(w·x − y)·x is a multiple of x, so from w = 0 the weights stay of the form c·x, and the fit needs c·‖x‖² = y. All exact fits have loss 0, so the loss does not choose: the path of training does. This **implicit bias** is widely seen as one key to generalisation; for deep networks its exact form is still open."
                    },
                    ru: {
                        q: "Линейную модель обучают градиентным спуском с функцией потерь (w·x − y)² на одной точке (x, y), начиная с w = 0; скорость обучения достаточно мала. Почему спуск сходится к точной подгонке с наименьшей нормой ‖w‖?",
                        options: ["Каждый градиент кратен x, поэтому и w всегда кратен x, а среди таких w точная подгонка одна — самая короткая", "Градиентный спуск незаметно добавляет затухание весов на каждом шаге, и веса уменьшаются", "В самой короткой точной подгонке потери ниже, чем в остальных, и спуск идёт прямо к ней", "У коротких векторов весов градиенты больше, чем у длинных, и спуск смещается к ним"],
                        hint: "Куда направлен градиент (w·x − y)² по w?",
                        why: "Градиент 2·(w·x − y)·x кратен x, поэтому из w = 0 веса всегда имеют вид c·x, а подгонка требует c·‖x‖² = y. Потери всех точных подгонок равны 0: выбирает не функция потерь, а траектория обучения. Это **неявное смещение** (implicit bias) многие считают одним из ключей к обобщению; у глубоких сетей его точный вид пока неясен."
                    }
                },
                {
                    type: "info", icon: "⏳",
                    en: {
                        title: "Grokking",
                        text: [
                            "Take a small algorithmic task, such as addition modulo a prime p, and train a network on part of the full table of sums. It can reach 100% training accuracy early, while its test accuracy stays near chance, 1/p.",
                            "Then, often many thousands of steps later, test accuracy rises to near 100%. This late generalisation, long after the training data were memorised, is called **grokking**. Weight decay makes it happen sooner; smaller training sets make it take longer.",
                            "In one studied case of modular addition, the trained network was found to compute the sum with an algorithm built on sine and cosine waves, not with a lookup table."
                        ]
                    },
                    ru: {
                        title: "Гроккинг",
                        text: [
                            "Возьмём маленькую алгоритмическую задачу, например сложение по модулю простого числа p, и будем обучать сеть на части полной таблицы сумм. Сеть может рано начать отвечать верно на всех обучающих примерах, а на тесте оставаться на уровне случайного угадывания, 1/p.",
                            "Потом, часто через многие тысячи шагов, доля верных ответов на тесте поднимается почти до 100%. Такое обобщение, наступающее намного позже заучивания обучающих данных, называют **«гроккингом»** (grokking). Затухание весов (weight decay) его ускоряет, а с меньшей обучающей выборкой его приходится ждать дольше.",
                            "В одном из изученных случаев сложения по модулю оказалось, что обученная сеть вычисляет сумму алгоритмом на основе синусов и косинусов, а не по заученной таблице."
                        ]
                    }
                },
                {
                    type: "choice",
                    en: {
                        q: "A network learns modular addition from part of the table. Training accuracy is 100% by step 1,000, but test accuracy stays near chance until step 30,000, then jumps close to 100%. What most likely makes the jump come sooner?",
                        options: ["Using stronger weight decay throughout training", "Stopping at step 1,000, as soon as training accuracy reaches 100%", "Training on a smaller part of the table", "Switching weight decay off, so that the network fits faster"],
                        hint: "What keeps acting on the weights once the training loss is already close to zero?",
                        why: "Weight decay keeps pushing the weights towards smaller, simpler solutions after the training data are fitted. Stopping at step 1,000 keeps a network that has only memorised; a smaller training set delays the jump, and without weight decay it usually comes later."
                    },
                    ru: {
                        q: "Сеть учится сложению по модулю на части таблицы. На обучении 100% верных ответов уже к шагу 1000, а на тесте до шага 30 000 — уровень угадывания, затем скачок почти до 100%. Что, скорее всего, приблизит этот скачок?",
                        options: ["Усилить затухание весов на всё время обучения", "Остановить обучение на шаге 1000, как только все обучающие примеры решены верно", "Обучать на меньшей части таблицы", "Отключить затухание весов, чтобы сеть быстрее подогнала данные"],
                        hint: "Что продолжает действовать на веса, когда потери на обучении уже почти нулевые?",
                        why: "Затухание весов и после подгонки обучающих данных продолжает тянуть веса к меньшим, более простым решениям. Остановка на шаге 1000 оставит сеть, которая лишь заучила данные; меньшая обучающая выборка отложит скачок, а без затухания весов он обычно наступает позже."
                    }
                },
                {
                    type: "info", icon: "🌊", mono: true,
                    en: {
                        title: "Lazy training or feature learning",
                        text: [
                            "Take the limit of infinite width under a particular scaling of the weights. Training then moves each weight only infinitesimally, and the network stays equal to its linearisation f_lin around the initial weights θ₀: a model that is linear in its parameters.",
                            "With squared loss, training amounts to kernel regression with a fixed kernel, the **neural tangent kernel** (NTK), and the hidden features stay as they were at initialisation. This is the **lazy regime**.",
                            "Networks used in practice change their hidden representations during training. This **feature learning** is widely seen as a key advantage over fixed kernels."
                        ],
                        example: ["f_lin(x; θ) = f(x; θ₀) + ∇_θ f(x; θ₀)·(θ − θ₀)", "NTK: K(x, x′) = ∇_θ f(x; θ₀)·∇_θ f(x′; θ₀)"],
                        note: "Laziness comes from the scaling, not from width alone: under other scalings, such as the mean-field one, even infinitely wide networks learn features."
                    },
                    ru: {
                        title: "Ленивое обучение или обучение признаков",
                        text: [
                            "Возьмём предел бесконечной ширины при определённом масштабировании весов. Тогда обучение сдвигает каждый вес лишь на бесконечно малую величину, и сеть совпадает со своей линеаризацией f_lin в окрестности начальных весов θ₀ — моделью, линейной по параметрам.",
                            "При квадратичной функции потерь обучение сводится к ядерной регрессии с фиксированным ядром — **нейронным касательным ядром** (neural tangent kernel, NTK), а скрытые признаки остаются такими же, как при инициализации. Это **ленивый режим обучения** (lazy regime).",
                            "На практике сети в ходе обучения меняют свои скрытые представления. Такое **обучение признаков** (feature learning) многие считают их ключевым преимуществом перед фиксированными ядрами."
                        ],
                        example: ["f_lin(x; θ) = f(x; θ₀) + ∇_θ f(x; θ₀)·(θ − θ₀)", "NTK: K(x, x′) = ∇_θ f(x; θ₀)·∇_θ f(x′; θ₀)"],
                        note: "Ленивый режим определяется масштабированием, а не одной лишь шириной: при других масштабированиях, например в режиме среднего поля (mean-field), даже бесконечно широкие сети выучивают признаки."
                    }
                },
                {
                    type: "choice", card: "r4d",
                    en: {
                        q: "In the lazy (neural tangent kernel, NTK) regime of very wide networks, what happens during training?",
                        options: ["The weights barely move, so the network acts like a linear model in its parameters, with a fixed kernel", "Every layer learns new features, and faster than in a narrow network, since more weights can change", "The gradients vanish almost at once, so training stops before the training data are fitted", "The network can no longer fit its training data, because a fixed kernel is too weak for that"],
                        why: "In this limit the features are fixed at initialisation, and training learns only a linear combination of them: that is exactly what “lazy” means. The network can still fit its training data, by kernel regression with the NTK. But this regime cannot explain the feature learning of practical networks."
                    },
                    ru: {
                        q: "Что происходит при обучении очень широкой сети в ленивом режиме (режиме нейронного касательного ядра, NTK)?",
                        options: ["Веса почти не сдвигаются, и сеть ведёт себя как линейная по параметрам модель с фиксированным ядром", "Каждый слой выучивает новые признаки, причём быстрее, чем в узкой сети: менять можно больше весов", "Градиенты почти сразу затухают, и обучение останавливается раньше, чем подогнаны обучающие данные", "Сеть больше не может подогнать обучающие данные: фиксированного ядра для этого недостаточно"],
                        why: "В этом пределе признаки фиксируются при инициализации, и обучение подбирает лишь их линейную комбинацию: именно это и значит «ленивый». Обучающие данные сеть при этом подогнать может — ядерной регрессией с NTK. Но объяснить обучение признаков в реальных сетях этот режим не может."
                    }
                },
                {
                    type: "recap",
                    en: {
                        points: [
                            "Networks that can memorise random labels still generalise with real ones, so capacity alone explains little, and a parameter count even less.",
                            "Test error can peak near the interpolation threshold and fall again beyond it: double descent, strongest with noisy labels and little regularisation.",
                            "Among many exact fits, the training algorithm picks one: on least squares, gradient descent from 0 with a small enough learning rate converges to the minimum-norm fit, `w = y·x / ‖x‖²` for one point. The implicit bias of deep networks is still being worked out.",
                            "Grokking (late generalisation, sped up by weight decay) and the lazy NTK regime versus feature learning show how much depends on the path of training."
                        ]
                    },
                    ru: {
                        points: [
                            "Сети, которые могут заучить случайные метки, с настоящими метками всё равно обобщают, так что одна лишь ёмкость мало что объясняет, а число параметров — тем более.",
                            "Ошибка на тесте может достичь пика у порога интерполяции и снова упасть за ним: это двойной спуск, сильнее всего выраженный при зашумлённых метках и слабой регуляризации.",
                            "Из многих точных подгонок алгоритм обучения выбирает одну: в задаче наименьших квадратов градиентный спуск из 0 при достаточно малой скорости обучения сходится к подгонке с минимальной нормой, `w = y·x / ‖x‖²` для одной точки. Неявное смещение глубоких сетей пока изучено не до конца.",
                            "Гроккинг (позднее обобщение, ускоряемое затуханием весов) и разница между ленивым режимом NTK и обучением признаков показывают, как много зависит от траектории обучения."
                        ]
                    }
                }
            ]
        },

        /* ----- r5. Latent variables and the ELBO ----- */
        r5: {
            steps: [
                {
                    type: "info", icon: "🎲", mono: true,
                    en: {
                        title: "A model with hidden causes",
                        text: [
                            "A **latent variable** z is an unobserved cause of the data x. First z is drawn from a simple **prior** p(z), its distribution before any x is seen: here N(0, I).",
                            "Then a neural **decoder** with weights θ maps z to a distribution p_θ(x | z) over x, for example a Gaussian with a mean predicted from z.",
                            "Maximum-likelihood training needs the log-likelihood ln p_θ(x) of every training example. But p_θ(x), called the **evidence** or marginal likelihood, is an integral over all possible z:"
                        ],
                        example: ["z ~ p(z) = N(0, I)", "x ~ p_θ(x | z)", "p_θ(x) = ∫ p_θ(x | z) · p(z) dz"]
                    },
                    ru: {
                        title: "Модель со скрытыми причинами",
                        text: [
                            "**Скрытая переменная** (latent variable) z — ненаблюдаемая причина данных x. Сначала z случайно выбирают из простого **априорного распределения** (prior) p(z), заданного до всяких наблюдений: здесь это N(0, I).",
                            "Затем нейросеть-**декодер** (decoder) с весами θ задаёт по z распределение p_θ(x | z), например нормальное со средним, предсказанным по z.",
                            "Для обучения методом максимального правдоподобия нужен логарифм правдоподобия ln p_θ(x) каждого обучающего примера. Но p_θ(x), **маргинальное правдоподобие** (evidence), — это интеграл по всем возможным z:"
                        ],
                        example: ["z ~ p(z) = N(0, I)", "x ~ p_θ(x | z)", "p_θ(x) = ∫ p_θ(x | z) · p(z) dz"]
                    }
                },
                {
                    type: "choice",
                    en: {
                        q: "A latent variable model has the prior p(z) = N(0, I) and a neural decoder p_θ(x | z). Why is it not trained by simply maximising ln p_θ(x) = ln ∫ p_θ(x | z)·p(z) dz?",
                        options: ["The integral has no closed form, and estimating it with z drawn from p(z) is far too noisy", "The decoder's density p_θ(x | z) cannot be computed, even for one given z", "Each exact value of a continuous x has probability 0, so ln p_θ(x) is always −∞", "The prior N(0, I) has no density that can be written down in closed form"],
                        hint: "What does one pass of the decoder give, and what does p_θ(x) need?",
                        why: "For a given z, p_θ(x | z) is cheap: one pass of the decoder. The hard part is the integral over z: it has no closed form, and for high-dimensional data almost no z drawn from the prior explains a given x. So an average of p_θ(x | z) over prior samples is dominated by rare lucky draws and is far too noisy."
                    },
                    ru: {
                        q: "У модели со скрытой переменной априорное распределение p(z) = N(0, I) и нейросеть-декодер p_θ(x | z). Почему её не обучают, просто максимизируя ln p_θ(x) = ln ∫ p_θ(x | z)·p(z) dz?",
                        options: ["Интеграл не берётся аналитически, а его оценка по z, выбранным из p(z), слишком шумная", "Плотность декодера p_θ(x | z) нельзя вычислить даже для одного заданного z", "У непрерывного x любое точное значение имеет вероятность 0, так что ln p_θ(x) всегда равен −∞", "У априорного распределения N(0, I) нет плотности, которую можно записать формулой"],
                        hint: "Что даёт один проход декодера и что нужно, чтобы найти p_θ(x)?",
                        why: "При заданном z плотность p_θ(x | z) считается дёшево, за один проход декодера. Трудность — в интеграле по z: аналитически он не берётся, а для многомерных данных почти ни одно z из априорного распределения не объясняет данный x. Поэтому среднее p_θ(x | z) по таким z определяют редкие удачные попадания, и оценка слишком шумная."
                    }
                },
                {
                    type: "info", icon: "📐", mono: true,
                    en: {
                        title: "The ELBO and its gap",
                        text: [
                            "Add an **encoder** q_φ(z | x): a second network, with weights φ, that maps x to a distribution over the z that could have produced it. It approximates the true **posterior** p_θ(z | x) = p_θ(x | z)·p(z) / p_θ(x), which is intractable, since it contains p_θ(x).",
                            "The **KL divergence** KL(q ‖ p) = E_q[ln q − ln p] is never negative and is 0 only when q = p. So, by the identity below, the **ELBO** (evidence lower bound) never exceeds ln p_θ(x), and the gap is exactly the KL between the encoder and the posterior.",
                            "Training maximises the ELBO in θ and φ together. A decoder and an encoder trained like this form a **variational autoencoder** (VAE)."
                        ],
                        example: ["ln p_θ(x) = ELBO + KL(q_φ(z | x) ‖ p_θ(z | x))", "ELBO = E_q[ln p_θ(x | z)] − KL(q_φ(z | x) ‖ p(z))"],
                        note: "Derivation: p_θ(x) = p_θ(x, z) / p_θ(z | x) for every z. Take ln, average over z ~ q_φ(z | x) (written E_q), add and subtract ln q_φ(z | x), then split p_θ(x, z) = p_θ(x | z) · p(z)."
                    },
                    ru: {
                        title: "ELBO и её зазор",
                        text: [
                            "Добавим **энкодер** (encoder) q_φ(z | x) — вторую сеть с весами φ, которая по x выдаёт распределение тех z, что могли породить этот x. Энкодер приближает истинное **апостериорное распределение** (posterior) p_θ(z | x) = p_θ(x | z)·p(z) / p_θ(x), которое нельзя вычислить точно: в него входит p_θ(x).",
                            "**Дивергенция Кульбака–Лейблера** (KL divergence) KL(q ‖ p) = E_q[ln q − ln p] никогда не бывает отрицательной и равна 0, только если q = p. Поэтому из тождества ниже следует, что **нижняя вариационная граница** (ELBO) не превосходит ln p_θ(x), а зазор — в точности KL между энкодером и апостериорным распределением.",
                            "При обучении ELBO максимизируют сразу по θ и φ. Декодер и энкодер, обученные так, образуют **вариационный автокодировщик** (VAE)."
                        ],
                        example: ["ln p_θ(x) = ELBO + KL(q_φ(z | x) ‖ p_θ(z | x))", "ELBO = E_q[ln p_θ(x | z)] − KL(q_φ(z | x) ‖ p(z))"],
                        note: "Вывод: p_θ(x) = p_θ(x, z) / p_θ(z | x) при любом z. Прологарифмируем, усредним по z ~ q_φ(z | x) (это усреднение и обозначают E_q), прибавим и вычтем ln q_φ(z | x), а затем разложим p_θ(x, z) = p_θ(x | z) · p(z)."
                    }
                },
                {
                    type: "number", answer: 12, card: "r5a",
                    en: {
                        q: "In a VAE with encoder q_φ(z | x) and decoder p_θ(x | z), one input x has ln p_θ(x) = −1000 nats and an ELBO of −1012 nats. What is KL(q_φ(z | x) ‖ p_θ(z | x)), the divergence between the encoder and the true posterior, in nats?",
                        hint: "ln p_θ(x) = ELBO + this KL.",
                        why: "From ln p_θ(x) = ELBO + KL: KL = ln p_θ(x) − ELBO = −1000 − (−1012) = 12 nats. It would be 0 only if the encoder matched the true posterior exactly. Since ln p_θ(x) does not depend on φ, improving the encoder raises the ELBO by exactly as much as it shrinks this gap."
                    },
                    ru: {
                        q: "В VAE с энкодером q_φ(z | x) и декодером p_θ(x | z) для входа x получилось ln p_θ(x) = −1000 нат и ELBO = −1012 нат. Чему равна KL(q_φ(z | x) ‖ p_θ(z | x)) между энкодером и истинным апостериорным распределением, в натах?",
                        hint: "ln p_θ(x) = ELBO + эта KL.",
                        why: "Из ln p_θ(x) = ELBO + KL следует: KL = ln p_θ(x) − ELBO = −1000 − (−1012) = 12 нат. Она была бы равна 0, только если бы энкодер в точности совпадал с истинным апостериорным распределением. А так как ln p_θ(x) от φ не зависит, улучшение энкодера поднимает ELBO ровно на столько, на сколько сокращает этот зазор."
                    }
                },
                {
                    type: "info", icon: "🔀", mono: true,
                    en: {
                        title: "The reparameterisation trick",
                        text: [
                            "The ELBO is an expectation over z ~ q_φ(z | x), estimated with sampled z. But backpropagation cannot pass through a random draw: if z is simply sampled from q_φ, no path leads from z back to φ.",
                            "The **reparameterisation trick** draws noise ε whose distribution does not depend on φ, and computes z as a deterministic, differentiable function of ε and of the encoder's outputs. Then, for a differentiable f such as ln p_θ(x | z), the gradient of E_q[f(z)] reaches φ by ordinary backpropagation."
                        ],
                        example: ["z = μ_φ(x) + σ_φ(x) · ε, ε ~ N(0, I)", "∇_φ E_q[f(z)] = E_ε[∇_φ f(μ_φ(x) + σ_φ(x) · ε)]", "per dimension: ∂z/∂μ = 1, ∂z/∂σ = ε", "without the trick: ∇_φ E_q[f(z)] = E_q[f(z) · ∇_φ ln q_φ(z | x)]"],
                        note: "The last line gives the score-function estimator (REINFORCE, also used by policy gradients). It also works for discrete z or a non-differentiable f, where the trick does not apply directly. Both estimators are unbiased, but this one usually has a much higher variance."
                    },
                    ru: {
                        title: "Трюк с репараметризацией",
                        text: [
                            "ELBO — это математическое ожидание по z ~ q_φ(z | x), и его оценивают по случайно выбранным z. Но обратное распространение ошибки не проходит через случайный выбор: если просто взять z из q_φ, от z к φ не ведёт ни один путь.",
                            "**Трюк с репараметризацией** (reparameterisation trick): берём шум ε, распределение которого не зависит от φ, и вычисляем z как детерминированную дифференцируемую функцию от ε и выходов энкодера. Тогда для дифференцируемой f, например ln p_θ(x | z), градиент E_q[f(z)] доходит до φ обычным обратным распространением ошибки."
                        ],
                        example: ["z = μ_φ(x) + σ_φ(x) · ε, ε ~ N(0, I)", "∇_φ E_q[f(z)] = E_ε[∇_φ f(μ_φ(x) + σ_φ(x) · ε)]", "по каждому измерению: ∂z/∂μ = 1, ∂z/∂σ = ε", "без трюка: ∇_φ E_q[f(z)] = E_q[f(z) · ∇_φ ln q_φ(z | x)]"],
                        note: "Последняя строка даёт оценку REINFORCE (score-function estimator); её же используют методы градиента по политике (policy gradient). Эта оценка годится и для дискретных z, и для недифференцируемой f, где трюк напрямую неприменим. Обе оценки несмещённые, но у REINFORCE дисперсия обычно намного выше."
                    }
                },
                {
                    type: "number", answer: -2, card: "r5b",
                    en: {
                        q: "With the reparameterisation trick, a VAE computes its latent sample as z = μ + σ·ε, where ε ~ N(0, 1). Here μ = 2, σ = 0.5, and the drawn noise is ε = −2. What is ∂z/∂σ for this sample?",
                        hint: "Differentiate μ + σ·ε with respect to σ, keeping ε fixed.",
                        why: "∂z/∂σ = ∂(μ + σ·ε)/∂σ = ε = −2, and the sample itself is z = 2 + 0.5·(−2) = 1. By the chain rule, for any loss L(z) computed from this sample, ∂L/∂σ = ∂L/∂z · (−2): a larger σ would move this z further below μ."
                    },
                    ru: {
                        q: "Используя трюк с репараметризацией, VAE вычисляет скрытую переменную как z = μ + σ·ε, где ε ~ N(0, 1). Здесь μ = 2, σ = 0,5, а выпавший шум ε = −2. Чему равна производная ∂z/∂σ для этого значения z?",
                        hint: "Продифференцируй μ + σ·ε по σ, считая ε постоянным.",
                        why: "∂z/∂σ = ∂(μ + σ·ε)/∂σ = ε = −2, а само значение z = 2 + 0,5·(−2) = 1. По цепному правилу для любой функции потерь L(z), вычисленной по этому z, ∂L/∂σ = ∂L/∂z · (−2): при большем σ значение z ушло бы ещё ниже μ."
                    }
                },
                {
                    type: "info", icon: "📦", mono: true,
                    en: {
                        title: "The KL term in closed form",
                        text: [
                            "Take a Gaussian encoder q_φ(z | x) = N(μ, diag(σ²)), whose μ and σ are outputs of the network, and the prior N(0, I). Then the KL term of the ELBO needs no sampling: it has a closed form in each dimension of z, and the KL of the whole z is the sum over its dimensions.",
                            "Both μ² and σ² − 1 − ln σ² are never negative, so the KL of one dimension is 0 only when μ = 0 and σ = 1, that is, when q_φ(z | x) equals the prior there."
                        ],
                        example: ["KL(N(μ, σ²) ‖ N(0, 1)) = ½ · (μ² + σ² − 1 − ln σ²)", "μ = 1, σ = 1 → 0.5 nats"]
                    },
                    ru: {
                        title: "Слагаемое KL в явном виде",
                        text: [
                            "Возьмём гауссов энкодер q_φ(z | x) = N(μ, diag(σ²)), где μ и σ выдаёт сеть, и априорное распределение N(0, I). Тогда слагаемое KL в ELBO не требует сэмплирования: в каждом измерении z для него есть явная формула, а KL для всего z — это сумма по измерениям.",
                            "И μ², и σ² − 1 − ln σ² никогда не бывают отрицательными, поэтому KL в одном измерении равна 0, только когда μ = 0 и σ = 1, то есть когда в нём q_φ(z | x) совпадает с априорным распределением."
                        ],
                        example: ["KL(N(μ, σ²) ‖ N(0, 1)) = ½ · (μ² + σ² − 1 − ln σ²)", "μ = 1, σ = 1 → 0,5 ната"]
                    }
                },
                {
                    type: "number", answer: 2, card: "r5c",
                    en: {
                        q: "A Gaussian encoder gives one dimension of z the mean μ = 2 and the standard deviation σ = 1. In that dimension, the KL to the prior is KL(N(μ, σ²) ‖ N(0, 1)) = ½·(μ² + σ² − 1 − ln σ²). What is it, in nats?",
                        hint: "Put the numbers in, and remember that ln 1 = 0.",
                        why: "½·(2² + 1² − 1 − ln 1) = ½·(4 + 1 − 1 − 0) = ½·4 = 2 nats. Moving the mean away from 0 costs μ²/2; a σ different from 1 would cost extra."
                    },
                    ru: {
                        q: "Гауссов энкодер выдаёт для одного измерения z среднее μ = 2 и стандартное отклонение σ = 1. В этом измерении KL относительно априорного распределения равна KL(N(μ, σ²) ‖ N(0, 1)) = ½·(μ² + σ² − 1 − ln σ²). Сколько это в натах?",
                        hint: "Подставь числа и вспомни, что ln 1 = 0.",
                        why: "½·(2² + 1² − 1 − ln 1) = ½·(4 + 1 − 1 − 0) = ½·4 = 2 ната. Сдвиг среднего от 0 стоит μ²/2, а значение σ, отличное от 1, добавило бы ещё."
                    }
                },
                {
                    type: "info", icon: "🧲", mono: true,
                    en: {
                        title: "Two forces",
                        text: [
                            "The two terms of the ELBO pull in different directions. The **reconstruction term** E_q[ln p_θ(x | z)] wants z to describe x as precisely as possible. The KL term pulls q_φ(z | x) towards the same prior for every x.",
                            "Averaged over the data, the KL term is called the **rate**: it is an upper bound on the mutual information between x and z under the encoder, that is, on how many nats z carries about x. A weight β > 1 on it (the **β-VAE**) tends to give a smoother latent space and blurrier reconstructions."
                        ],
                        example: ["E_q[ln p_θ(x | z)] − β · KL(q_φ(z | x) ‖ p(z))", "β = 1: the ELBO; β > 1: the β-VAE objective", "rate = E_x[KL(q_φ(z | x) ‖ p(z))] ≥ I(x; z)"],
                        note: "Diffusion models, the next step of your path, are usually trained by maximising a reweighted ELBO of the same kind."
                    },
                    ru: {
                        title: "Две силы",
                        text: [
                            "Два слагаемых ELBO тянут в разные стороны. **Слагаемое реконструкции** (reconstruction term) E_q[ln p_θ(x | z)] требует, чтобы по z можно было как можно точнее восстановить x. А слагаемое KL для каждого x тянет q_φ(z | x) к одному и тому же априорному распределению.",
                            "Слагаемое KL, усреднённое по данным, называют **скоростью** (rate): она ограничивает сверху взаимную информацию между x и z при кодировании энкодером, то есть сколько нат z несёт об x. Вес β > 1 при слагаемом KL (**β-VAE**) обычно даёт более гладкое латентное пространство (latent space) и более размытые реконструкции."
                        ],
                        example: ["E_q[ln p_θ(x | z)] − β · KL(q_φ(z | x) ‖ p(z))", "β = 1: ELBO; β > 1: целевая функция β-VAE", "скорость = E_x[KL(q_φ(z | x) ‖ p(z))] ≥ I(x; z)"],
                        note: "Диффузионные модели — тема следующего шага твоего пути — обычно обучают, максимизируя перевзвешенную ELBO того же рода."
                    }
                },
                {
                    type: "choice", card: "r5d",
                    en: {
                        q: "A VAE has a very powerful decoder: it predicts each pixel from all the previous ones. Training reaches a good ELBO, but KL(q_φ(z | x) ‖ p(z)) ends up close to 0 for every input. What has most likely happened?",
                        options: ["Posterior collapse: z carries almost no information, and the decoder models x without it", "The encoder found a code for x so efficient that it costs almost no nats of KL", "The learning rate is too small, so the encoder has barely moved from its initial weights", "The prior N(0, I) is too narrow for the data, so the codes have no room to spread out"],
                        hint: "What does KL(q_φ(z | x) ‖ p(z)) ≈ 0 say about how much q_φ(z | x) depends on x?",
                        why: "KL ≈ 0 means q_φ(z | x) ≈ p(z) for every x: z says nothing about x. A decoder that models x alone gains little from z, while the KL term penalises every nat that z carries. Common remedies: a weaker decoder, KL annealing (the KL weight grows from 0) or “free bits” (a minimum KL per dimension)."
                    },
                    ru: {
                        q: "У VAE очень мощный декодер: каждый пиксель он предсказывает по всем предыдущим. Обучение даёт хорошее значение ELBO, но KL(q_φ(z | x) ‖ p(z)) в итоге близка к 0 для каждого входа. Что, скорее всего, произошло?",
                        options: ["Коллапс апостериорного распределения: z почти не несёт информации, и декодер моделирует x без z", "Энкодер нашёл для x настолько экономный код, что тот почти ничего не стоит в натах KL", "Скорость обучения слишком мала, и энкодер почти не отошёл от начальных весов", "Априорное распределение N(0, I) слишком узкое для данных, и кодам негде разойтись"],
                        hint: "Что KL(q_φ(z | x) ‖ p(z)) ≈ 0 говорит о том, насколько q_φ(z | x) зависит от x?",
                        why: "KL ≈ 0 значит, что q_φ(z | x) ≈ p(z) для каждого x: z ничего не говорит об x. Декодеру, который моделирует x и без z, код почти не помогает, а слагаемое KL штрафует за каждый нат, который несёт z. Обычно помогают более слабый декодер, отжиг KL (KL annealing: вес KL растёт от 0) или free bits (минимум KL на измерение)."
                    }
                },
                {
                    type: "recap",
                    en: {
                        points: [
                            "A latent variable model `p_θ(x) = ∫ p_θ(x | z)·p(z) dz` with a neural decoder has an intractable likelihood, so a VAE trains an encoder q_φ(z | x) alongside the decoder.",
                            "`ln p_θ(x) = ELBO + KL(q_φ(z | x) ‖ p_θ(z | x))`: the ELBO is a lower bound, and its gap is the KL between the encoder and the true posterior.",
                            "The reparameterisation `z = μ + σ·ε` lets gradients flow through samples (∂z/∂σ = ε). With a Gaussian encoder and the prior N(0, I), the KL term is the sum over dimensions of `½·(μ² + σ² − 1 − ln σ²)`.",
                            "When the decoder can model x without z, the KL can fall to about 0 and z becomes useless: posterior collapse."
                        ]
                    },
                    ru: {
                        points: [
                            "У модели со скрытой переменной `p_θ(x) = ∫ p_θ(x | z)·p(z) dz` и нейросетью-декодером правдоподобие нельзя вычислить точно, поэтому VAE обучает вместе с декодером энкодер q_φ(z | x).",
                            "`ln p_θ(x) = ELBO + KL(q_φ(z | x) ‖ p_θ(z | x))`: ELBO — нижняя граница, а её зазор — это KL между энкодером и истинным апостериорным распределением.",
                            "Репараметризация `z = μ + σ·ε` пропускает градиент через случайно выбранные z (∂z/∂σ = ε). Для гауссова энкодера и априорного распределения N(0, I) слагаемое KL — это сумма `½·(μ² + σ² − 1 − ln σ²)` по измерениям.",
                            "Если декодер обходится без z, KL может упасть почти до 0, и код z становится бесполезным: это коллапс апостериорного распределения (posterior collapse)."
                        ]
                    }
                }
            ]
        },

        /* ----- r6. Diffusion models ----- */
        r6: {
            steps: [
                {
                    type: "info", icon: "🌫️", mono: true,
                    en: {
                        title: "Destroy, then learn to undo",
                        text: [
                            "A **diffusion model** learns to undo a fixed **forward process**. Over T steps, that process adds a little Gaussian noise to the data, until almost nothing but noise remains. A network learns the **reverse process**: removing the noise step by step.",
                            "Step s multiplies x_(s−1) by √(1 − β_s) and adds Gaussian noise of variance β_s; the sequence β_1, …, β_T is the **noise schedule**. The noises of different steps are independent Gaussians, and a weighted sum of such variables is Gaussian too, so x_t for any t can be drawn from x₀ in one go:"
                        ],
                        example: ["x_t = √ᾱ_t · x₀ + √(1 − ᾱ_t) · ε, ε ~ N(0, I)", "ᾱ_t = (1 − β_1) · … · (1 − β_t): from 1 at t = 0 to ≈ 0 at t = T", "ᾱ_t = 0.64 → x_t = 0.8 · x₀ + 0.6 · ε"]
                    },
                    ru: {
                        title: "Разрушить, а затем научиться восстанавливать",
                        text: [
                            "**Диффузионная модель** учится обращать фиксированный **прямой процесс** (зашумление). За T шагов он понемногу добавляет к данным гауссов шум, пока не останется почти чистый шум. Сеть выучивает **обратный процесс**, который шаг за шагом убирает этот шум.",
                            "Шаг s умножает x_(s−1) на √(1 − β_s) и добавляет гауссов шум с дисперсией β_s; последовательность β_1, …, β_T — это **расписание шума** (noise schedule). Шумы разных шагов — независимые гауссовы величины, а взвешенная сумма таких величин тоже гауссова, поэтому x_t при любом t можно сразу получить из x₀:"
                        ],
                        example: ["x_t = √ᾱ_t · x₀ + √(1 − ᾱ_t) · ε, ε ~ N(0, I)", "ᾱ_t = (1 − β_1) · … · (1 − β_t): от 1 при t = 0 до ≈ 0 при t = T", "ᾱ_t = 0,64 → x_t = 0,8 · x₀ + 0,6 · ε"]
                    }
                },
                {
                    type: "number", answer: 0.5, tolerance: 0.005, card: "r6a",
                    en: {
                        q: "In a diffusion model, the noisy value is x_t = √ᾱ_t·x₀ + √(1 − ᾱ_t)·ε. With ᾱ_t = 0.64, the clean value x₀ = 1 and the noise ε = −0.5, what is x_t?",
                        hint: "√0.64 = 0.8. What is √(1 − 0.64)?",
                        why: "√0.64 = 0.8 and √(1 − 0.64) = √0.36 = 0.6, so x_t = 0.8·1 + 0.6·(−0.5) = 0.8 − 0.3 = 0.5. The two squared weights always add up to 1: here 0.64 + 0.36."
                    },
                    ru: {
                        q: "В диффузионной модели зашумлённое значение вычисляется как x_t = √ᾱ_t·x₀ + √(1 − ᾱ_t)·ε. Чему равно x_t при ᾱ_t = 0,64, чистом значении x₀ = 1 и шуме ε = −0,5?",
                        hint: "√0,64 = 0,8. А чему равен √(1 − 0,64)?",
                        why: "√0,64 = 0,8 и √(1 − 0,64) = √0,36 = 0,6, поэтому x_t = 0,8·1 + 0,6·(−0,5) = 0,8 − 0,3 = 0,5. Квадраты двух весов всегда дают в сумме 1: здесь 0,64 + 0,36."
                    }
                },
                {
                    type: "info", icon: "🎯", mono: true,
                    en: {
                        title: "The network predicts the noise",
                        text: [
                            "A network ε_θ(x_t, t) learns to recover the added noise: draw x₀ from the data, a random t and ε ~ N(0, I), form x_t, and minimise ‖ε − ε_θ(x_t, t)‖². With fixed reverse variances, this is the negative ELBO up to one weight per t and a constant: x_1, …, x_T are the latents, and the forward process is a fixed encoder.",
                            "The predicted noise gives an estimate x̂₀ of the clean data. The ideal prediction, the one with the lowest expected squared error, is E[ε | x_t]; up to a known factor, it equals the **score** ∇ ln p_t(x_t), the gradient of the log density of the noisy data with respect to x_t."
                        ],
                        example: ["x̂₀ = (x_t − √(1 − ᾱ_t) · ε_θ) / √ᾱ_t", "x_t = 0.5, ᾱ_t = 0.64, ε_θ = −0.5 → x̂₀ = (0.5 + 0.3) / 0.8 = 1", "ideal: ε_θ(x_t, t) = E[ε | x_t] = −√(1 − ᾱ_t) · ∇ ln p_t(x_t)"],
                        note: "With the ideal ε_θ, x̂₀ = E[x₀ | x_t]: the posterior mean over all clean data that could have produced x_t, so under heavy noise it is a blurry average."
                    },
                    ru: {
                        title: "Сеть предсказывает шум",
                        text: [
                            "Сеть ε_θ(x_t, t) учится восстанавливать добавленный шум: берём x₀ из данных, случайные t и ε ~ N(0, I), строим x_t и минимизируем ‖ε − ε_θ(x_t, t)‖². При фиксированных дисперсиях обратных шагов это −ELBO с точностью до веса при каждом t и константы: x_1, …, x_T — скрытые переменные, а прямой процесс — фиксированный энкодер.",
                            "Из предсказанного шума получается оценка x̂₀ чистых данных. Идеальное предсказание — с наименьшей ожидаемой квадратичной ошибкой — это E[ε | x_t]; с точностью до известного множителя оно равно **скору** (score) ∇ ln p_t(x_t), градиенту логарифма плотности зашумлённых данных по x_t."
                        ],
                        example: ["x̂₀ = (x_t − √(1 − ᾱ_t) · ε_θ) / √ᾱ_t", "x_t = 0,5; ᾱ_t = 0,64; ε_θ = −0,5 → x̂₀ = (0,5 + 0,3) / 0,8 = 1", "в идеале: ε_θ(x_t, t) = E[ε | x_t] = −√(1 − ᾱ_t) · ∇ ln p_t(x_t)"],
                        note: "При идеальном ε_θ оценка x̂₀ = E[x₀ | x_t] — апостериорное среднее по всем чистым данным, которые могли дать этот x_t, поэтому при сильном шуме это размытое среднее."
                    }
                },
                {
                    type: "choice", card: "r6b",
                    en: {
                        q: "A diffusion model's network ε_θ(x_t, t) sees only the noisy input x_t and the step t, and is trained to predict the added noise, minimising the squared error. Up to a known factor, what does the best possible prediction equal?",
                        options: ["The score ∇ ln p_t(x_t): the gradient of the log density of the noisy data", "The log-likelihood ln p(x₀) of the clean data, computed in one pass", "The exact noise ε that was added, so x₀ is recovered without error", "The schedule value ᾱ_t, which says how much noise x_t contains"],
                        hint: "Many pairs of x₀ and ε lead to the same x_t. What does the best squared-error prediction become?",
                        why: "The best squared-error prediction is the mean E[ε | x_t], and E[ε | x_t] = −√(1 − ᾱ_t)·∇ ln p_t(x_t): learning to denoise is learning the score (denoising score matching). Many ε fit the same x_t, so the exact one cannot be recovered; ᾱ_t is fixed in advance; the likelihood takes far more work."
                    },
                    ru: {
                        q: "В диффузионной модели сеть ε_θ(x_t, t) видит только зашумлённый вход x_t и шаг t; она учится предсказывать добавленный шум, минимизируя квадрат ошибки. Чему с точностью до известного множителя равно наилучшее предсказание?",
                        options: ["Скору (score) ∇ ln p_t(x_t) — градиенту логарифма плотности зашумлённых данных", "Логарифму правдоподобия ln p(x₀) чистых данных, вычисленному за один проход", "Ровно тому шуму ε, который был добавлен: тогда x₀ восстанавливается без ошибки", "Значению ᾱ_t из расписания шума: оно показывает, сколько в x_t шума"],
                        hint: "Один и тот же x_t получается из многих пар x₀ и ε. Каким тогда будет лучшее предсказание по квадратичной ошибке?",
                        why: "Лучшее по квадратичной ошибке предсказание — среднее E[ε | x_t], а E[ε | x_t] = −√(1 − ᾱ_t)·∇ ln p_t(x_t): учиться убирать шум — значит выучивать скор (denoising score matching). Одному x_t отвечает много разных ε, так что точный шум не восстановить; расписание ᾱ_t задано заранее; правдоподобие требует куда больше работы."
                    }
                },
                {
                    type: "info", icon: "🔁",
                    en: {
                        title: "Sampling: from noise to data",
                        text: [
                            "Generation, or **sampling**, starts from pure noise x_T ~ N(0, I) and repeatedly removes a little of it, using the network's prediction at every step. Early steps typically settle the overall layout, late steps the fine details.",
                            "The first samplers took about 1000 steps. Deterministic samplers often need only tens: they solve an ordinary differential equation (ODE) with the same marginal distributions p_t as the forward process, the **probability flow ODE**.",
                            "**Distillation** trains a student model to do in a few steps, or even one, what a teacher model does in many."
                        ]
                    },
                    ru: {
                        title: "Сэмплирование: от шума к данным",
                        text: [
                            "Генерация, или **сэмплирование**, начинается с чистого шума x_T ~ N(0, I) и раз за разом понемногу убирает его, на каждом шаге опираясь на предсказание сети. Ранние шаги обычно задают общую композицию, поздние — мелкие детали.",
                            "Первые сэмплеры делали около 1000 шагов. Детерминированным сэмплерам часто хватает десятков: они решают обыкновенное дифференциальное уравнение (ОДУ) с теми же маргинальными распределениями p_t, что и у прямого процесса, — **ОДУ вероятностного потока** (probability flow ODE).",
                            "**Дистилляция** (distillation) учит модель-ученика делать за несколько шагов или даже за один то, на что модели-учителю нужно много шагов."
                        ]
                    }
                },
                {
                    type: "order",
                    en: {
                        q: "Put the steps of generating a sample with a trained diffusion model in order.",
                        items: ["Draw x_T from N(0, I)", "Let the network predict the noise in the current x_t", "Use the predicted noise to step to a slightly less noisy x_(t−1)", "After the last step, output x₀"],
                        why: "Generation runs the forward process backwards: the middle two steps repeat for t = T, T − 1, …, 1. A stochastic sampler also adds a little fresh noise in each move except the last; a deterministic one does not."
                    },
                    ru: {
                        q: "Расставь по порядку шаги, которыми обученная диффузионная модель генерирует новый образец.",
                        items: ["Взять x_T из N(0, I)", "Предсказать сетью шум в текущем x_t", "По предсказанному шуму перейти к чуть менее зашумлённому x_(t−1)", "После последнего шага выдать x₀"],
                        why: "Генерация проходит прямой процесс в обратную сторону: два средних шага повторяются для t = T, T − 1, …, 1. Стохастический сэмплер при каждом переходе, кроме последнего, ещё и добавляет немного свежего шума, а детерминированный — нет."
                    }
                },
                {
                    type: "info", icon: "🧭", mono: true,
                    en: {
                        title: "Classifier-free guidance",
                        text: [
                            "**Classifier-free guidance** helps a model follow a condition c, such as a text prompt. One network is trained both with c and without it: c is dropped for some of the training examples. At sampling time, its two noise predictions are combined with a weight w.",
                            "Setting w = 0 gives the unconditional model, and w = 1 the plain conditional one. With w > 1, sampling moves further from “any image” towards “this prompt”: the result follows the prompt more closely, with less variety. A very large w tends to give oversaturated, unnatural images."
                        ],
                        example: ["ε_g = ε_u + w · (ε_c − ε_u)", "ε_u: without the prompt, ε_c: with it", "ideal: ε_c − ε_u = −√(1 − ᾱ_t) · ∇ ln p_t(c | x_t)"],
                        note: "The last line explains the name: the difference acts as the gradient of an implicit classifier, so no separate classifier is trained. Some papers write (1 + w′)·ε_c − w′·ε_u: the same rule with w′ = w − 1."
                    },
                    ru: {
                        title: "Наведение без классификатора",
                        text: [
                            "**Наведение без классификатора** (classifier-free guidance) помогает модели следовать условию c, например текстовому запросу (промпту). Одну и ту же сеть учат и с c, и без него: у части обучающих примеров условие отбрасывают. При сэмплировании два её предсказания шума объединяют с весом w.",
                            "При w = 0 получается безусловная модель, при w = 1 — обычная условная. При w > 1 сэмплирование уходит дальше от «какой-нибудь картинки» к «картинке по этому запросу»: результат точнее следует запросу, но разнообразие падает. При очень большом w картинки часто выходят перенасыщенными и неестественными."
                        ],
                        example: ["ε_g = ε_u + w · (ε_c − ε_u)", "ε_u — без запроса, ε_c — с запросом", "в идеале: ε_c − ε_u = −√(1 − ᾱ_t) · ∇ ln p_t(c | x_t)"],
                        note: "Последняя строка объясняет название: разность работает как градиент неявного классификатора, так что отдельный классификатор не обучают. В некоторых статьях пишут (1 + w′)·ε_c − w′·ε_u: это то же правило при w′ = w − 1."
                    }
                },
                {
                    type: "number", answer: 1.1, tolerance: 0.005, card: "r6c",
                    en: {
                        q: "Classifier-free guidance combines two noise predictions: ε_g = ε_u + w·(ε_c − ε_u). For one pixel, the prediction without the prompt is ε_u = 0.2, the one with it is ε_c = 0.5, and w = 3. What is ε_g?",
                        hint: "Start with the difference ε_c − ε_u.",
                        why: "ε_c − ε_u = 0.5 − 0.2 = 0.3, so ε_g = 0.2 + 3·0.3 = 0.2 + 0.9 = 1.1. The result lies beyond even the conditional prediction 0.5: with w > 1, guidance does not average, it extrapolates past ε_c, away from ε_u."
                    },
                    ru: {
                        q: "Наведение без классификатора (classifier-free guidance) объединяет два предсказания шума: ε_g = ε_u + w·(ε_c − ε_u). Для одного пикселя предсказание без запроса ε_u = 0,2, с запросом ε_c = 0,5, а w = 3. Чему равно ε_g?",
                        hint: "Начни с разности ε_c − ε_u.",
                        why: "ε_c − ε_u = 0,5 − 0,2 = 0,3, поэтому ε_g = 0,2 + 3·0,3 = 0,2 + 0,9 = 1,1. Результат выходит даже за условное предсказание 0,5: при w > 1 наведение не усредняет, а экстраполирует — за ε_c, в сторону от ε_u."
                    }
                },
                {
                    type: "info", icon: "🗜️",
                    en: {
                        title: "Diffusion in a latent space",
                        text: [
                            "The cost of each denoising step grows with the size of the input, and sampling repeats the step many times. So an **autoencoder**, an encoder and a decoder trained beforehand to reconstruct images, compresses each image into a much smaller array: its **latent**.",
                            "Both training and sampling of the diffusion model happen in this latent space: this is **latent diffusion**. The decoder turns the final latent back into pixels once, at the end."
                        ],
                        example: ["image: 512 × 512 pixels × 3 colour channels = 786,432 values", "latent: 64 × 64 × 4 = 16,384 values"]
                    },
                    ru: {
                        title: "Диффузия в латентном пространстве",
                        text: [
                            "Каждый шаг удаления шума стоит тем дороже, чем больше вход, а при сэмплировании шагов много. Поэтому **автокодировщик** (autoencoder) — энкодер и декодер, заранее обученные восстанавливать изображения, — сжимает каждую картинку в гораздо меньший массив: её **латентное представление** (latent).",
                            "И обучение, и сэмплирование диффузионной модели идут в этом латентном пространстве: это **латентная диффузия** (latent diffusion). Декодер один раз, в самом конце, переводит итоговое латентное представление обратно в пиксели."
                        ],
                        example: ["картинка: 512 × 512 пикселей × 3 цветовых канала = 786 432 числа", "латентное представление: 64 × 64 × 4 = 16 384 числа"]
                    }
                },
                {
                    type: "number", answer: 48, card: "r6d",
                    en: {
                        q: "An image of 512 × 512 pixels with 3 colour channels is encoded into a latent of 64 × 64 × 4 numbers. How many times fewer numbers does a diffusion model process when it works on the latent instead of the image?",
                        hint: "Compare the positions first (512/64 = 8 per side), then the channels.",
                        why: "512·512·3 = 786,432 and 64·64·4 = 16,384, and 786,432 / 16,384 = 48. Or factor by factor: (512/64)² = 64 times fewer positions, but 4 channels instead of 3, so 64·3/4 = 48."
                    },
                    ru: {
                        q: "Картинку 512 × 512 пикселей с 3 цветовыми каналами сжимают в латентное представление 64 × 64 × 4. Во сколько раз меньше чисел обрабатывает диффузионная модель, работающая с латентным представлением, а не с картинкой?",
                        hint: "Сначала сравни число позиций (512/64 = 8 по каждой стороне), потом число каналов.",
                        why: "512·512·3 = 786 432 и 64·64·4 = 16 384, а 786 432 / 16 384 = 48. Или по множителям: позиций в (512/64)² = 64 раза меньше, но каналов 4 вместо 3, так что 64·3/4 = 48."
                    }
                },
                {
                    type: "info", icon: "➡️", mono: true,
                    en: {
                        title: "Flow matching",
                        text: [
                            "**Flow matching**, a newer family of methods, learns a **velocity field**: a direction and speed for every point and time. Its flow links data and noise. Join a data point x₀ and a noise sample ε by a straight path: along it, the velocity is constant.",
                            "A network v_θ(x_t, t) is trained to predict this velocity. Sampling starts from noise at t = 1 and follows the learned velocity back to t = 0, for example with Euler steps. Straighter paths can be followed with fewer steps."
                        ],
                        example: ["x_t = (1 − t) · x₀ + t · ε, t from 0 (data) to 1 (noise)", "dx_t / dt = ε − x₀", "loss: ‖(ε − x₀) − v_θ(x_t, t)‖²", "Euler step back: x_(t−Δt) = x_t − Δt · v_θ(x_t, t)"]
                    },
                    ru: {
                        title: "Сопоставление потоков",
                        text: [
                            "**Сопоставление потоков** (flow matching), более новое семейство методов, выучивает **поле скоростей** (velocity field): направление и скорость движения для каждой точки и момента времени. Поток этого поля связывает данные и шум. Соединим точку данных x₀ и шум ε прямолинейным путём: скорость вдоль него постоянна.",
                            "Сеть v_θ(x_t, t) учится предсказывать эту скорость. Сэмплирование начинается с шума при t = 1 и движется по выученному полю скоростей назад, к t = 0, например шагами метода Эйлера. По более прямым путям можно пройти за меньшее число шагов."
                        ],
                        example: ["x_t = (1 − t) · x₀ + t · ε, t от 0 (данные) до 1 (шум)", "dx_t / dt = ε − x₀", "функция потерь: ‖(ε − x₀) − v_θ(x_t, t)‖²", "шаг Эйлера назад: x_(t−Δt) = x_t − Δt · v_θ(x_t, t)"]
                    }
                },
                {
                    type: "choice",
                    en: {
                        q: "In flow matching, the path x_t = (1 − t)·x₀ + t·ε runs from the data x₀ at t = 0 to the noise ε at t = 1. What target does the network learn to predict at x_t?",
                        options: ["The velocity ε − x₀, constant along each straight path", "The velocity x₀ − ε, since sampling moves from the noise to the data", "The time t, which says how far along its path x_t lies", "The sum x₀ + ε of the data point and the noise"],
                        hint: "Differentiate the path with respect to t.",
                        why: "The derivative of (1 − t)·x₀ + t·ε with respect to t is ε − x₀; sampling runs t backwards, so it moves along −v_θ, towards the data. Many paths cross the same x_t, so the network learns the mean of ε − x₀ over them; integrated from t = 1 to 0, this mean field still carries the noise distribution to the data distribution."
                    },
                    ru: {
                        q: "В сопоставлении потоков путь x_t = (1 − t)·x₀ + t·ε ведёт от данных x₀ при t = 0 к шуму ε при t = 1. Что сеть учится предсказывать в точке x_t?",
                        options: ["Скорость ε − x₀, постоянную вдоль каждого прямого пути", "Скорость x₀ − ε: ведь сэмплирование идёт от шума к данным", "Время t, которое показывает, какую часть пути прошла точка x_t", "Сумму x₀ + ε точки данных и шума"],
                        hint: "Продифференцируй путь по t.",
                        why: "Производная (1 − t)·x₀ + t·ε по t равна ε − x₀; сэмплирование идёт по t назад и потому движется вдоль −v_θ, к данным. Через одну точку x_t проходит много путей, так что сеть выучивает среднее ε − x₀ по ним; при интегрировании от t = 1 до 0 это среднее поле всё равно переводит распределение шума в распределение данных."
                    }
                },
                {
                    type: "recap",
                    en: {
                        points: [
                            "The forward process `x_t = √ᾱ_t·x₀ + √(1 − ᾱ_t)·ε` destroys data and can be sampled at any t in one go. A network ε_θ learns to predict the noise, which is the same as learning the score ∇ ln p_t(x_t) up to the factor −√(1 − ᾱ_t).",
                            "Sampling starts from noise and denoises step by step: about 1000 steps in early samplers, tens with ODE solvers, a few or even one after distillation.",
                            "Classifier-free guidance `ε_g = ε_u + w·(ε_c − ε_u)` trades variety for faithfulness to the prompt. Latent diffusion saves work by running in a space compressed by an autoencoder.",
                            "Flow matching trains a network to predict the velocity ε − x₀ along straight paths between data and noise; straighter paths need fewer sampling steps."
                        ]
                    },
                    ru: {
                        points: [
                            "Прямой процесс `x_t = √ᾱ_t·x₀ + √(1 − ᾱ_t)·ε` разрушает данные, и x_t при любом t можно получить сразу. Сеть ε_θ учится предсказывать шум, а это то же самое, что выучивать скор ∇ ln p_t(x_t) с точностью до множителя −√(1 − ᾱ_t).",
                            "Сэмплирование начинается с шума и убирает его шаг за шагом: около 1000 шагов у ранних сэмплеров, десятки с решателями ОДУ, несколько или даже один после дистилляции.",
                            "Наведение без классификатора `ε_g = ε_u + w·(ε_c − ε_u)` жертвует разнообразием ради точности следования запросу. Латентная диффузия экономит вычисления, работая в пространстве, сжатом автокодировщиком.",
                            "В сопоставлении потоков сеть учится предсказывать скорость ε − x₀ на прямых путях между данными и шумом; чем прямее пути, тем меньше шагов нужно при сэмплировании."
                        ]
                    }
                }
            ]
        },

        /* ----- r7. Reinforcement learning: the core ----- */
        r7: {
            steps: [
                {
                    type: "info", icon: "🎮", mono: true,
                    en: {
                        title: "The loop and the return",
                        text: [
                            "In **reinforcement learning**, an agent learns by acting. In state s it picks an action a with its **policy** π(a | s), the probability of each action in each state; the environment answers with a reward r and the next state s′.",
                            "The goal is the largest expected **return**: the sum of future rewards, each step further ahead weighted by one more factor γ, the **discount factor**. A small γ makes the agent short-sighted."
                        ],
                        example: ["G = r₁ + γ · r₂ + γ² · r₃ + …, 0 ≤ γ < 1"],
                        note: "With γ < 1 and bounded rewards, the sum stays finite even if the task never ends. Tasks that always end can also use γ = 1."
                    },
                    ru: {
                        title: "Цикл взаимодействия и отдача",
                        text: [
                            "В **обучении с подкреплением** (reinforcement learning) агент учится, действуя. В состоянии s он выбирает действие a по своей **политике** (policy) π(a | s), которая задаёт вероятность каждого действия в каждом состоянии; среда отвечает наградой (reward) r и следующим состоянием s′.",
                            "Цель — максимальная ожидаемая **отдача** (return): сумма будущих наград, где награда каждого следующего шага умножается ещё на один множитель γ — **коэффициент дисконтирования** (discount factor). При малом γ агент становится близоруким."
                        ],
                        example: ["G = r₁ + γ · r₂ + γ² · r₃ + …, 0 ≤ γ < 1"],
                        note: "При γ < 1 и ограниченных наградах сумма конечна, даже если задача никогда не заканчивается. В задачах, которые всегда заканчиваются, используют и γ = 1."
                    }
                },
                {
                    type: "number", answer: 1.5, tolerance: 0.005,
                    en: {
                        q: "An agent receives the rewards 1, 0 and 2 on its next three steps, and nothing after that. With discount factor γ = 0.5, what is its return?",
                        hint: "G = r₁ + γ·r₂ + γ²·r₃, and γ² = 0.25.",
                        why: "G = 1 + 0.5·0 + 0.25·2 = 1 + 0 + 0.5 = 1.5. The later a reward comes, the less it counts: the 2 on the third step is worth only 0.5 now."
                    },
                    ru: {
                        q: "Агент получает награды 1, 0 и 2 на трёх следующих шагах, а после этого — ничего. Чему равна его отдача при коэффициенте дисконтирования γ = 0,5?",
                        hint: "G = r₁ + γ·r₂ + γ²·r₃, а γ² = 0,25.",
                        why: "G = 1 + 0,5·0 + 0,25·2 = 1 + 0 + 0,5 = 1,5. Чем позже награда, тем меньше она весит: награда 2 на третьем шаге сейчас стоит лишь 0,5."
                    }
                },
                {
                    type: "info", icon: "🔁", mono: true,
                    en: {
                        title: "Bellman's idea",
                        text: [
                            "The **value function** V^π(s) is the expected return from state s when the agent follows π. It obeys a recursion, the **Bellman equation**: the value is the expected sum of the next reward and the discounted value of the next state.",
                            "Suppose the reward is 1 at every step, forever. Then every state has the same value V, and the recursion gives V = 1/(1 − γ). This is the **effective horizon**: roughly how many steps ahead the agent looks."
                        ],
                        example: ["V^π(s) = E[r + γ · V^π(s′)]", "a ~ π(· | s); r and s′ come from the environment", "r = 1 always: V = 1 + γ · V → V = 1 / (1 − γ)"]
                    },
                    ru: {
                        title: "Идея Беллмана",
                        text: [
                            "**Функция ценности** (value function) V^π(s) — ожидаемая отдача из состояния s, если агент следует политике π. Она подчиняется рекурсии — **уравнению Беллмана**: ценность равна математическому ожиданию суммы следующей награды и дисконтированной ценности следующего состояния.",
                            "Пусть агент получает награду 1 на каждом шаге, и так бесконечно. Тогда у всех состояний одна и та же ценность V, и рекурсия даёт V = 1/(1 − γ). Это **эффективный горизонт** (effective horizon): примерно на столько шагов вперёд смотрит агент."
                        ],
                        example: ["V^π(s) = E[r + γ · V^π(s′)]", "a ~ π(· | s); r и s′ выдаёт среда", "всегда r = 1: V = 1 + γ · V → V = 1 / (1 − γ)"]
                    }
                },
                {
                    type: "number", answer: 10, card: "r7a",
                    en: {
                        q: "An agent receives a reward of 1 at every step, forever. With discount factor γ = 0.9, what is its return G = r₁ + γ·r₂ + γ²·r₃ + …?",
                        hint: "After the first reward, the rest of the stream looks exactly like the whole stream: G = 1 + γ·G.",
                        why: "G = 1 + 0.9·G gives 0.1·G = 1, so G = 1/(1 − 0.9) = 1/0.1 = 10. The geometric series 1 + 0.9 + 0.81 + … gives the same, and 1/(1 − γ) is the effective horizon: with γ = 0.99 it would be 100."
                    },
                    ru: {
                        q: "Агент получает награду 1 на каждом шаге, и так бесконечно. Чему равна его отдача G = r₁ + γ·r₂ + γ²·r₃ + … при коэффициенте дисконтирования γ = 0,9?",
                        hint: "После первой награды оставшийся поток выглядит точно так же, как весь: G = 1 + γ·G.",
                        why: "Из G = 1 + 0,9·G получаем 0,1·G = 1, то есть G = 1/(1 − 0,9) = 1/0,1 = 10. То же даёт сумма геометрического ряда 1 + 0,9 + 0,81 + …, а величина 1/(1 − γ) — это эффективный горизонт: при γ = 0,99 он был бы равен 100."
                    }
                },
                {
                    type: "info", icon: "📝", mono: true,
                    en: {
                        title: "Q-learning",
                        text: [
                            "The optimal **action value** Q*(s, a) is the expected return after taking a in s and acting optimally afterwards. **Q-learning** learns it from single steps (s, a, r, s′): it moves its estimate Q(s, a) towards a target by α times the **TD error** (temporal-difference error).",
                            "The target takes the max over a′, whatever the agent actually does next. So the agent can act with a mix, mostly the best-known action (**exploitation**) and sometimes a random one (**exploration**), and still learn the values of the greedy policy: Q-learning is **off-policy**."
                        ],
                        example: ["Q(s, a) ← Q(s, a) + α · (r + γ · max_a′ Q(s′, a′) − Q(s, a))", "target: r + γ · max_a′ Q(s′, a′); TD error: target − Q(s, a)"],
                        note: "With finitely many states and actions, bounded rewards, γ < 1 and a table of Q values, if every pair (s, a) is tried infinitely often and α shrinks suitably, Q converges to Q* with probability 1. With a neural network in place of the table, there is no such guarantee in general."
                    },
                    ru: {
                        title: "Q-обучение",
                        text: [
                            "Оптимальная **ценность действия** (action value) Q*(s, a) — ожидаемая отдача после действия a в s, если дальше действовать оптимально. **Q-обучение** (Q-learning) выучивает её по отдельным шагам (s, a, r, s′): сдвигает оценку Q(s, a) к цели на α, умноженное на **ошибку временной разности** (TD error).",
                            "Цель берёт максимум по a′, что бы агент ни сделал дальше. Поэтому агент может в основном выбирать лучшее известное действие (**использование**, exploitation), а иногда случайное (**исследование**, exploration) — и всё равно выучивать ценности жадной политики: Q-обучение работает **вне политики** (off-policy)."
                        ],
                        example: ["Q(s, a) ← Q(s, a) + α · (r + γ · max_a′ Q(s′, a′) − Q(s, a))", "цель: r + γ · max_a′ Q(s′, a′); ошибка TD: цель − Q(s, a)"],
                        note: "При конечном числе состояний и действий, ограниченных наградах, γ < 1 и таблице значений Q, если каждая пара (s, a) пробуется бесконечно часто, а α подходящим образом убывает, Q с вероятностью 1 сходится к Q*. С нейросетью вместо таблицы такой гарантии в общем случае нет."
                    }
                },
                {
                    type: "number", answer: 6, card: "r7b",
                    en: {
                        q: "Q-learning update: Q(s, a) ← Q(s, a) + α·(r + γ·max_a′ Q(s′, a′) − Q(s, a)). Now Q(s, a) = 2; the agent gets r = 1 and lands in s′, where the largest Q(s′, a′) is 10. With γ = 0.9 and α = 0.5, what is the new Q(s, a)?",
                        hint: "First compute the target r + γ·10, then move Q(s, a) a fraction α of the way towards it.",
                        why: "Target = 1 + 0.9·10 = 10; TD error = 10 − 2 = 8; new Q(s, a) = 2 + 0.5·8 = 6. With α = 0.5 the estimate moves half of the way to the target; α = 1 would jump straight to it."
                    },
                    ru: {
                        q: "Правило Q-обучения: Q(s, a) ← Q(s, a) + α·(r + γ·max_a′ Q(s′, a′) − Q(s, a)). Сейчас Q(s, a) = 2; агент получает r = 1 и попадает в s′, где наибольшее Q(s′, a′) равно 10. Чему станет равно Q(s, a) при γ = 0,9 и α = 0,5?",
                        hint: "Сначала найди цель r + γ·10, затем сдвинь Q(s, a) к ней на долю α от разрыва.",
                        why: "Цель = 1 + 0,9·10 = 10; ошибка временной разности = 10 − 2 = 8; новое Q(s, a) = 2 + 0,5·8 = 6. При α = 0,5 оценка проходит половину пути до цели, а при α = 1 сразу стала бы равна цели."
                    }
                },
                {
                    type: "info", icon: "🎲", mono: true,
                    en: {
                        title: "Policy gradients",
                        text: [
                            "A **policy gradient** method tunes the parameters θ of a policy π_θ directly, by gradient ascent on its expected return J(θ). It raises the log-probability of actions whose return G beat a **baseline** b(s), and lowers it for actions whose return fell short.",
                            "A baseline that depends on the state only, not on the action, adds no bias, and a good one can cut the variance a lot. With b(s) = V^π(s), the factor G − V^π(s) estimates the **advantage** A^π(s, a) = Q^π(s, a) − V^π(s): how much better a is than what π does on average in s."
                        ],
                        example: ["∇J(θ) = E[∇ log π_θ(a | s) · (G − b(s))]"],
                        note: "E is over the states and actions met when following π_θ, and G is the return from the step where a was taken. Q^π(s, a) is the expected return after taking a in s and following π afterwards."
                    },
                    ru: {
                        title: "Градиент по политике",
                        text: [
                            "Метод **градиента по политике** (policy gradient) настраивает параметры θ политики π_θ напрямую — градиентным подъёмом по её ожидаемой отдаче J(θ). Он повышает логарифм вероятности действий, чья отдача G превысила **базовую линию** (baseline) b(s), и понижает его для действий, чья отдача до неё не дотянула.",
                            "Базовая линия, которая зависит только от состояния, а не от действия, не вносит смещения, а удачная может сильно снизить дисперсию. При b(s) = V^π(s) множитель G − V^π(s) оценивает **преимущество** (advantage) A^π(s, a) = Q^π(s, a) − V^π(s): насколько a лучше того, что π в среднем делает в s."
                        ],
                        example: ["∇J(θ) = E[∇ log π_θ(a | s) · (G − b(s))]"],
                        note: "E берётся по состояниям и действиям, которые встречаются при следовании π_θ, а G — отдача начиная с шага, где выбрано a. Q^π(s, a) — ожидаемая отдача после действия a в s, если дальше следовать π."
                    }
                },
                {
                    type: "choice", card: "r7c",
                    en: {
                        q: "In the policy gradient E[∇ log π_θ(a | s)·(G − b(s))], the baseline b(s) depends on the state but not on the action. Why does subtracting it add no bias?",
                        options: ["The mean of ∇ log π_θ(a | s) over a ~ π_θ(· | s) is 0 (probabilities sum to 1), so b(s) drops out", "The baseline is subtracted only after the update has been applied, so the gradient never sees it", "b(s) is trained with the same gradient as the policy, so the errors of the two cancel out", "It does add some bias, but only a little, and the lower variance more than pays for it"],
                        hint: "Fix s and use π·∇ log π = ∇π.",
                        why: "For each s (with an integral for continuous actions): Σ_a π_θ(a | s)·∇ log π_θ(a | s) = Σ_a ∇π_θ(a | s) = ∇ Σ_a π_θ(a | s) = ∇1 = 0. So the baseline changes the variance, not the expectation: even a rough learned V(s) cannot bias the gradient."
                    },
                    ru: {
                        q: "В градиенте по политике E[∇ log π_θ(a | s)·(G − b(s))] базовая линия b(s) зависит от состояния, но не от действия. Почему её вычитание не вносит смещения?",
                        options: ["Среднее ∇ log π_θ(a | s) по a ~ π_θ(· | s) равно 0 (вероятности в сумме дают 1), так что b(s) выпадает", "Базовую линию вычитают только после того, как обновление сделано, так что градиент её не видит", "b(s) обучается тем же градиентом, что и политика, поэтому их ошибки взаимно гасятся", "Смещение она вносит, но небольшое, и снижение дисперсии с лихвой его окупает"],
                        hint: "Зафиксируй s и вспомни, что π·∇ log π = ∇π.",
                        why: "Для каждого s (для непрерывных действий — с интегралом): Σ_a π_θ(a | s)·∇ log π_θ(a | s) = Σ_a ∇π_θ(a | s) = ∇ Σ_a π_θ(a | s) = ∇1 = 0. Значит, базовая линия меняет дисперсию, но не математическое ожидание: даже грубо выученная V(s) не может сместить градиент."
                    }
                },
                {
                    type: "info", icon: "✂️", mono: true,
                    en: {
                        title: "PPO: small, safe steps",
                        text: [
                            "**PPO** (proximal policy optimisation) collects data with the current policy, from then on called π_old, and reuses them for several gradient steps on θ. Its objective relies on advantages A estimated for π_old, so it is a good guide only while π_θ stays close to π_old.",
                            "The **probability ratio** ρ compares the new and the old probability of an action. Once ρ leaves [1 − ε, 1 + ε] in the direction that helps, above 1 + ε when A > 0 or below 1 − ε when A < 0, the objective stops rewarding further change."
                        ],
                        example: ["ρ = π_θ(a | s) / π_old(a | s)", "L(θ) = E[min(ρ · A, clip(ρ, 1 − ε, 1 + ε) · A)]", "L is maximised; a typical ε = 0.2"],
                        note: "Clipping removes the incentive, not the possibility: updates driven by other samples can still move ρ outside the range."
                    },
                    ru: {
                        title: "PPO: маленькие безопасные шаги",
                        text: [
                            "**PPO** (proximal policy optimisation) собирает данные текущей политикой, которую дальше называют π_old, и делает по ним несколько градиентных шагов по θ. Целевая функция опирается на преимущества A, оценённые для π_old, поэтому ей можно доверять, только пока π_θ остаётся близко к π_old.",
                            "**Отношение вероятностей** (probability ratio) ρ сравнивает новую и старую вероятность действия. Когда ρ выходит из [1 − ε, 1 + ε] в выгодную сторону — выше 1 + ε при A > 0 или ниже 1 − ε при A < 0, — целевая функция перестаёт поощрять дальнейшее изменение."
                        ],
                        example: ["ρ = π_θ(a | s) / π_old(a | s)", "L(θ) = E[min(ρ · A, clip(ρ, 1 − ε, 1 + ε) · A)]", "L максимизируют; типичное значение ε = 0,2"],
                        note: "Обрезка (clipping) убирает стимул, а не возможность: обновления, вызванные другими примерами, всё равно могут вывести ρ за пределы диапазона."
                    }
                },
                {
                    type: "number", answer: 2.4, tolerance: 0.005, card: "r7d",
                    en: {
                        q: "The PPO objective for one action is min(ρ·A, clip(ρ, 1 − ε, 1 + ε)·A), with ρ = π_θ(a | s)/π_old(a | s) and ε = 0.2. The advantage is A = 2, and ρ has reached 1.5. What is the value of the objective?",
                        hint: "clip(1.5, 0.8, 1.2) = 1.2.",
                        why: "ρ·A = 1.5·2 = 3, and the clipped term is 1.2·2 = 2.4; the minimum is 2.4. The clipped term does not depend on θ, so its gradient is 0: making this action even more likely earns nothing more in this round."
                    },
                    ru: {
                        q: "Целевая функция PPO для одного действия: min(ρ·A, clip(ρ, 1 − ε, 1 + ε)·A), где ρ = π_θ(a | s)/π_old(a | s), а ε = 0,2. Преимущество A = 2, а отношение ρ выросло до 1,5. Чему равно значение целевой функции?",
                        hint: "clip(1,5; 0,8; 1,2) = 1,2.",
                        why: "ρ·A = 1,5·2 = 3, а обрезанный член равен 1,2·2 = 2,4; минимум равен 2,4. Обрезанный член не зависит от θ, поэтому его градиент равен 0: делать это действие ещё вероятнее в этом раунде уже ничего не даёт."
                    }
                },
                {
                    type: "choice",
                    en: {
                        q: "In PPO with ε = 0.2, an action with negative advantage A = −1 now has ratio ρ = 1.5: the new policy made it more likely. Which term does min(ρ·A, clip(ρ, 0.8, 1.2)·A) take?",
                        options: ["The unclipped one (−1.5): the gradient still pushes this action's probability down", "The clipped one (−1.2): the gradient is zero, so this action's probability stays as it is", "Neither: with a negative advantage, PPO sets this action's objective to zero", "The clipped one (+1.2): every ratio above 1 + ε is replaced by 1.2 before the min"],
                        hint: "Compute both terms, ρ·A and clip(ρ, 0.8, 1.2)·A, and take the smaller one.",
                        why: "ρ·A = −1.5 and clip(ρ, 0.8, 1.2)·A = −1.2, so the min is −1.5. Clipping only removes gains: a change that made a bad action more likely is always penalised in full. For ρ = 0.5 and A = −1 the min takes the clipped −0.8: pushing ρ below 0.8 earns nothing."
                    },
                    ru: {
                        q: "В PPO с ε = 0,2 у действия с отрицательным преимуществом A = −1 отношение стало ρ = 1,5: новая политика сделала это действие вероятнее. Какой член выберет min(ρ·A; clip(ρ; 0,8; 1,2)·A)?",
                        options: ["Необрезанный (−1,5): градиент по-прежнему снижает вероятность этого действия", "Обрезанный (−1,2): градиент равен нулю, и вероятность действия не меняется", "Никакой: при отрицательном преимуществе PPO обнуляет целевую функцию этого действия", "Обрезанный (+1,2): любое отношение выше 1 + ε заменяется на 1,2 ещё до минимума"],
                        hint: "Вычисли оба члена, ρ·A и clip(ρ; 0,8; 1,2)·A, и возьми меньший.",
                        why: "ρ·A = −1,5 и clip(ρ; 0,8; 1,2)·A = −1,2, так что минимум равен −1,5. Обрезка убирает только выигрыш: изменение, которое сделало плохое действие вероятнее, всегда штрафуется полностью. При ρ = 0,5 и A = −1 минимум берёт обрезанное −0,8: снижать ρ ниже 0,8 уже ничего не даёт."
                    }
                },
                {
                    type: "recap",
                    en: {
                        points: [
                            "The return `G = r₁ + γ·r₂ + γ²·r₃ + …` weights each further step by one more factor γ; a reward of 1 at every step gives `1/(1 − γ)`, the effective horizon.",
                            "Values obey the Bellman recursion `V^π(s) = E[r + γ·V^π(s′)]`. Q-learning moves Q(s, a) towards `r + γ·max_a′ Q(s′, a′)` by α times the TD error, and it is off-policy.",
                            "A policy gradient raises `log π_θ(a | s)` in proportion to `G − b(s)`; a baseline that depends only on the state can cut the variance without adding bias.",
                            "PPO's objective `min(ρ·A, clip(ρ, 1 − ε, 1 + ε)·A)` stops rewarding moves of ρ past 1 ± ε in the helpful direction, but it never clips a penalty."
                        ]
                    },
                    ru: {
                        points: [
                            "Отдача `G = r₁ + γ·r₂ + γ²·r₃ + …` умножает награду каждого следующего шага ещё на γ; награда 1 на каждом шаге даёт `1/(1 − γ)` — эффективный горизонт.",
                            "Ценности подчиняются рекурсии Беллмана `V^π(s) = E[r + γ·V^π(s′)]`. Q-обучение сдвигает Q(s, a) к `r + γ·max_a′ Q(s′, a′)` на α, умноженное на ошибку временной разности, и работает вне политики.",
                            "Градиент по политике повышает `log π_θ(a | s)` пропорционально `G − b(s)`; базовая линия, зависящая только от состояния, может снизить дисперсию, не внося смещения.",
                            "Целевая функция PPO `min(ρ·A, clip(ρ, 1 − ε, 1 + ε)·A)` перестаёт поощрять уход ρ за 1 ± ε в выгодную сторону, но никогда не обрезает штраф."
                        ]
                    }
                }
            ]
        },

        /* ----- r8. Learning from preferences: RLHF and DPO ----- */
        r8: {
            steps: [
                {
                    type: "info", icon: "⚖️",
                    en: {
                        title: "Teaching taste",
                        text: [
                            "Pretraining teaches a model to continue text like its corpus, not to be helpful, honest or careful. **RLHF** (reinforcement learning from human feedback) teaches it what people prefer, from their comparisons: people find it easier to compare two answers than to write a perfect one.",
                            "After pretraining, the usual recipe begins with **supervised fine-tuning** (SFT) on answers written by people. Then comes the comparison data: a person sees two answers to the same prompt and picks the better one.",
                            "A **reward model**, a network that maps a prompt and an answer to one number, is fitted to these comparisons. Then RL, often PPO, optimises the model against it, with a **KL penalty** that keeps the model close to the SFT model."
                        ]
                    },
                    ru: {
                        title: "Как научить модель вкусу",
                        text: [
                            "Предобучение учит модель продолжать текст, подражая обучающему корпусу, а не быть полезной, честной и осторожной. **Обучение с подкреплением на основе отзывов людей** (RLHF) учит её тому, что предпочитают люди, по их сравнениям: людям проще сравнить два ответа, чем написать идеальный.",
                            "После предобучения обычный рецепт начинается с **дообучения на примерах** (supervised fine-tuning, SFT) — на ответах, написанных людьми. Затем собирают пары сравнений: человек видит два ответа на один и тот же промпт и выбирает лучший.",
                            "**Модель вознаграждения** (reward model) — сеть, которая сопоставляет промпту и ответу одно число, — обучается на этих сравнениях. Затем модель оптимизируют по ней методом RL, часто PPO, со **штрафом за KL** (KL penalty), который держит её близко к модели после SFT."
                        ]
                    }
                },
                {
                    type: "order",
                    en: {
                        q: "Put the usual steps of RLHF in order.",
                        items: ["Pretrain the model on a large text corpus", "Fine-tune it on answers written by people", "Train a reward model on pairs of answers that people compared", "Optimise the model with RL against the reward model, with a KL penalty"],
                        hint: "Which step needs a reward model, and what does the reward model learn from?",
                        why: "Each step builds on the one before. Fine-tuning starts from the pretrained model; the compared answers usually come from the fine-tuned model; and RL needs the reward model to score the answers that the policy samples."
                    },
                    ru: {
                        q: "Расставь обычные шаги RLHF по порядку.",
                        items: ["Предобучить модель на большом корпусе текстов", "Дообучить её на ответах, написанных людьми", "Обучить модель вознаграждения на парах ответов, которые сравнили люди", "Оптимизировать модель методом RL по модели вознаграждения со штрафом за KL"],
                        hint: "Какому шагу нужна модель вознаграждения и на чём её обучают?",
                        why: "Каждый шаг опирается на предыдущий. Дообучение начинается с предобученной модели; сравнивают обычно ответы дообученной модели; а шагу RL модель вознаграждения нужна, чтобы оценивать ответы, которые сэмплирует политика."
                    }
                },
                {
                    type: "info", icon: "📊", mono: true,
                    en: {
                        title: "The Bradley–Terry model",
                        text: [
                            "A reward model gives each answer y a number r(y). The **Bradley–Terry model** links these numbers to people's choices: it assumes that people prefer one answer to another with probability σ of the difference of their rewards.",
                            "The reward model is fitted by maximum likelihood: it minimises the average of −ln P over the pairs that people compared, where y_w is the chosen answer and y_l the rejected one."
                        ],
                        example: ["P(y_w ≻ y_l) = σ(r(y_w) − r(y_l))", "loss = −ln σ(r(y_w) − r(y_l))", "equal rewards → P = 0.5"],
                        note: "r(y) is short for r(x, y), the reward of answer y to prompt x. Both answers of a pair answer the same prompt."
                    },
                    ru: {
                        title: "Модель Брэдли–Терри",
                        text: [
                            "Модель вознаграждения ставит каждому ответу y число r(y). **Модель Брэдли–Терри** (Bradley–Terry) связывает эти числа с выбором людей: она предполагает, что люди предпочитают один ответ другому с вероятностью σ от разности их наград.",
                            "Модель вознаграждения обучают методом максимального правдоподобия: минимизируют среднее −ln P по парам, которые сравнили люди; y_w — выбранный ответ, y_l — отвергнутый."
                        ],
                        example: ["P(y_w ≻ y_l) = σ(r(y_w) − r(y_l))", "функция потерь = −ln σ(r(y_w) − r(y_l))", "равные награды → P = 0,5"],
                        note: "r(y) — краткая запись r(x, y), награды за ответ y на промпт x. Оба ответа пары отвечают на один и тот же промпт."
                    }
                },
                {
                    type: "number", answer: 0.75, tolerance: 0.005, share: true, card: "r8a",
                    en: {
                        q: "Under the Bradley–Terry model, P(A is preferred to B) = σ(r(A) − r(B)), where σ(z) = 1/(1 + e^(−z)). A reward model scores answer A exactly ln 3 higher than answer B. What is the probability that A is preferred?",
                        hint: "e^(−ln 3) = 1/3.",
                        why: "σ(ln 3) = 1/(1 + e^(−ln 3)) = 1/(1 + 1/3) = 3/4 = 0.75. The reward gap is the log-odds of the preference: ln 3 means odds of 3 to 1. If people did prefer A, the Bradley–Terry loss on this pair is −ln 0.75 ≈ 0.29."
                    },
                    ru: {
                        q: "По модели Брэдли–Терри ответ A предпочтут ответу B с вероятностью σ(r(A) − r(B)), где σ(z) = 1/(1 + e^(−z)). Модель вознаграждения ставит A ровно на ln 3 выше, чем B. С какой вероятностью предпочтут A?",
                        hint: "e^(−ln 3) = 1/3.",
                        why: "σ(ln 3) = 1/(1 + e^(−ln 3)) = 1/(1 + 1/3) = 3/4 = 0,75. Разность наград — это логарифм шансов (log-odds): ln 3 означает шансы 3 к 1. Если люди действительно предпочли A, функция потерь Брэдли–Терри на этой паре равна −ln 0,75 ≈ 0,29."
                    }
                },
                {
                    type: "choice", card: "r8b",
                    en: {
                        q: "A reward model was trained with the Bradley–Terry model, P(A is preferred to B) = σ(r(A) − r(B)). Then 5 is added to every reward it outputs. How do its predicted preferences change?",
                        options: ["Not at all: only differences of rewards enter, so rewards have no fixed zero", "They get sharper: every probability moves further away from 0.5", "They get flatter: every probability moves closer to 0.5 than before", "In every pair, the higher-scored answer now wins with probability σ(5)"],
                        hint: "Put r(A) + 5 and r(B) + 5 into the formula.",
                        why: "σ((r(A) + 5) − (r(B) + 5)) = σ(r(A) − r(B)): every prediction, and the loss, stay the same. The loss pins down the scale of rewards, through σ, but not their zero: even a different shift for each prompt goes unnoticed. So raw rewards mean little across reward models, or across prompts, without a common reference."
                    },
                    ru: {
                        q: "Модель вознаграждения обучили по модели Брэдли–Терри: ответ A предпочтут ответу B с вероятностью σ(r(A) − r(B)). Затем к каждой награде, которую она выдаёт, прибавили 5. Как изменятся предсказанные ею предпочтения?",
                        options: ["Никак: входят только разности наград, поэтому у наград нет фиксированного нуля", "Станут резче: каждая вероятность отойдёт дальше от 0,5", "Сгладятся: каждая вероятность станет ближе к 0,5, чем была", "В каждой паре ответ с большей наградой теперь побеждает с вероятностью σ(5)"],
                        hint: "Подставь в формулу r(A) + 5 и r(B) + 5.",
                        why: "σ((r(A) + 5) − (r(B) + 5)) = σ(r(A) − r(B)): все предсказания и функция потерь не меняются. Функция потерь задаёт масштаб наград (через σ), но не их ноль: она не заметит даже отдельного сдвига для каждого промпта. Поэтому сырые награды разных моделей или разных промптов без общей точки отсчёта мало что значат."
                    }
                },
                {
                    type: "info", icon: "🎯", mono: true,
                    en: {
                        title: "The objective and its exact optimum",
                        text: [
                            "The RL step treats the model as a policy π(y | x), written π(y) for short: a distribution over answers y to a prompt x. It maximises the expected reward minus a KL penalty, β·KL(π ‖ π_ref), where π_ref is the **reference model**, usually the SFT model.",
                            "Over all such distributions, this objective has an exact optimum π*: π_ref reweighted by exp(r/β) and divided by the normalising constant Z(x), the **partition function**. A small β lets π* chase the reward; a large β keeps it close to π_ref."
                        ],
                        example: ["maximise over π: E[r(y)] − β · KL(π ‖ π_ref), where y ~ π", "π*(y) = π_ref(y) · exp(r(y) / β) / Z(x)", "Z(x) = Σ_y π_ref(y) · exp(r(y) / β)"],
                        note: "One-line proof: E[r(y)] − β·KL(π ‖ π_ref) = β·ln Z(x) − β·KL(π ‖ π*), and KL(π ‖ π*) ≥ 0, with equality only for π = π*. Z(x) sums over all possible answers, far too many to enumerate: RL approximates π* by sampling instead."
                    },
                    ru: {
                        title: "Целевая функция и её точный оптимум",
                        text: [
                            "Шаг RL рассматривает модель как политику π(y | x), кратко π(y): распределение ответов y на промпт x. Он максимизирует ожидаемую награду минус штраф за KL, β·KL(π ‖ π_ref), где π_ref — **эталонная модель** (reference model), обычно модель после SFT.",
                            "Среди всех таких распределений у этой целевой функции есть точный оптимум π*: π_ref, перевзвешенная множителем exp(r/β) и делённая на нормирующий множитель Z(x) — **статсумму** (partition function). При малом β оптимум гонится за наградой, при большом — держится близко к π_ref."
                        ],
                        example: ["максимизировать по π: E[r(y)] − β · KL(π ‖ π_ref), где y ~ π", "π*(y) = π_ref(y) · exp(r(y) / β) / Z(x)", "Z(x) = Σ_y π_ref(y) · exp(r(y) / β)"],
                        note: "Доказательство в одну строку: E[r(y)] − β·KL(π ‖ π_ref) = β·ln Z(x) − β·KL(π ‖ π*), а KL(π ‖ π*) ≥ 0, причём равенство — только при π = π*. Z(x) — сумма по всем возможным ответам, которых слишком много, чтобы их перебрать: RL приближается к π*, сэмплируя ответы."
                    }
                },
                {
                    type: "number", answer: 0.8, tolerance: 0.005, share: true, card: "r8c",
                    en: {
                        q: "The policy that maximises E[r] − β·KL(π ‖ π_ref) is π*(y) ∝ π_ref(y)·exp(r(y)/β). Only two answers, A and B, are possible: π_ref(A) = π_ref(B) = 0.5, and r(A) − r(B) = β·ln 4. What is π*(A)?",
                        hint: "First find the ratio π*(A)/π*(B).",
                        why: "The normalising constant cancels in the ratio: π*(A)/π*(B) = (π_ref(A)/π_ref(B))·exp((r(A) − r(B))/β) = 1·exp(ln 4) = 4, so π*(A) = 4/(4 + 1) = 0.8. With the same reward gap, a smaller β would push π*(A) closer to 1."
                    },
                    ru: {
                        q: "Политика, максимизирующая E[r] − β·KL(π ‖ π_ref), — это π*(y) ∝ π_ref(y)·exp(r(y)/β). Возможны только два ответа, A и B: π_ref(A) = π_ref(B) = 0,5, а r(A) − r(B) = β·ln 4. Чему равно π*(A)?",
                        hint: "Сначала найди отношение π*(A)/π*(B).",
                        why: "В отношении нормирующий множитель сокращается: π*(A)/π*(B) = (π_ref(A)/π_ref(B))·exp((r(A) − r(B))/β) = 1·exp(ln 4) = 4, поэтому π*(A) = 4/(4 + 1) = 0,8. При том же разрыве в наградах меньшее β приблизило бы π*(A) к 1."
                    }
                },
                {
                    type: "info", icon: "✨", mono: true,
                    en: {
                        title: "DPO: no separate reward model",
                        text: [
                            "Solve the optimum for the reward: r(y) is β times the log-ratio of π* to π_ref, plus β·ln Z(x), which depends only on the prompt x. Bradley–Terry uses only the difference between the rewards of two answers to the same prompt, so Z(x) cancels.",
                            "**DPO** (direct preference optimisation) puts the trained policy π_θ in place of π* and minimises the Bradley–Terry loss on the comparison pairs. Its **implicit reward** is β·ln(π_θ(y)/π_ref(y)): no separate reward model is trained, and nothing is sampled from π_θ during training."
                        ],
                        example: ["r(y) = β · ln(π*(y) / π_ref(y)) + β · ln Z(x)", "loss = −ln σ(β · ln(π_θ(y_w) / π_ref(y_w)) − β · ln(π_θ(y_l) / π_ref(y_l)))"],
                        note: "ln π(y) is the log-probability of the whole answer y to the prompt x: the sum of the log-probabilities of its tokens."
                    },
                    ru: {
                        title: "DPO: без отдельной модели вознаграждения",
                        text: [
                            "Выразим из оптимума награду: r(y) равна β, умноженному на логарифм отношения π* к π_ref, плюс β·ln Z(x), а это слагаемое зависит только от промпта x. Модель Брэдли–Терри использует только разность наград двух ответов на один и тот же промпт, поэтому Z(x) сокращается.",
                            "**DPO** (direct preference optimisation) ставит на место π* обучаемую политику π_θ и минимизирует функцию потерь Брэдли–Терри на парах сравнений. Её **неявная награда** (implicit reward) — β·ln(π_θ(y)/π_ref(y)): отдельной модели вознаграждения нет, и во время обучения из π_θ ничего не сэмплируют."
                        ],
                        example: ["r(y) = β · ln(π*(y) / π_ref(y)) + β · ln Z(x)", "функция потерь = −ln σ(β · ln(π_θ(y_w) / π_ref(y_w)) − β · ln(π_θ(y_l) / π_ref(y_l)))"],
                        note: "ln π(y) — логарифм вероятности всего ответа y на промпт x, то есть сумма логарифмов вероятностей его токенов."
                    }
                },
                {
                    type: "number", answer: 0.4, tolerance: 0.005,
                    en: {
                        q: "DPO's implicit reward of an answer y is β·ln(π_θ(y)/π_ref(y)). For one answer, ln π_θ(y) = −10 and ln π_ref(y) = −14 (log-probabilities of the whole answer), and β = 0.1. What is its implicit reward?",
                        hint: "ln(a/b) = ln a − ln b.",
                        why: "0.1·(−10 − (−14)) = 0.1·4 = 0.4: the trained policy makes this answer e⁴ ≈ 55 times as likely as the reference model does. If π_θ = π*, the implicit reward equals r(y) − β·ln Z(x): the reward minus a term that depends only on the prompt, which Bradley–Terry ignores."
                    },
                    ru: {
                        q: "Неявная награда DPO для ответа y равна β·ln(π_θ(y)/π_ref(y)). Для одного ответа ln π_θ(y) = −10 и ln π_ref(y) = −14 (логарифмы вероятности всего ответа), а β = 0,1. Чему равна его неявная награда?",
                        hint: "ln(a/b) = ln a − ln b.",
                        why: "0,1·(−10 − (−14)) = 0,1·4 = 0,4: обученная политика делает этот ответ в e⁴ ≈ 55 раз вероятнее, чем эталонная модель. Если π_θ = π*, неявная награда равна r(y) − β·ln Z(x): это награда минус слагаемое, зависящее только от промпта, а его модель Брэдли–Терри не замечает."
                    }
                },
                {
                    type: "choice", card: "r8d",
                    en: {
                        q: "DPO writes the reward of an answer y to a prompt x as r(y) = β·ln(π*(y)/π_ref(y)) + β·ln Z(x): π* is the optimal policy, π_ref the reference model, Z(x) a sum over all answers to x. Why does Z(x) drop out of the DPO loss?",
                        options: ["Both answers share the prompt x, so their two β·ln Z(x) terms are equal and cancel", "Training drives Z(x) towards 1, so the term β·ln Z(x) shrinks to zero", "DPO scores each answer without its prompt, so no term in the loss can depend on x", "The term β·ln Z(x) is absorbed into β, whose value is tuned by hand anyway"],
                        hint: "What does Bradley–Terry do with the two rewards of a pair?",
                        why: "Bradley–Terry uses only r(y_w) − r(y_l), and both answers share x, so the two β·ln Z(x) terms cancel. Z(x) does not depend on θ, so training cannot change it; and it sums over all possible answers, far too many to compute: this cancellation is what makes DPO practical."
                    },
                    ru: {
                        q: "DPO записывает награду ответа y на промпт x как r(y) = β·ln(π*(y)/π_ref(y)) + β·ln Z(x): π* — оптимальная политика, π_ref — эталонная модель, Z(x) — сумма по всем ответам на x. Почему Z(x) выпадает из функции потерь DPO?",
                        options: ["Оба ответа отвечают на один промпт x, так что их слагаемые β·ln Z(x) равны и сокращаются", "Обучение приближает Z(x) к 1, так что слагаемое β·ln Z(x) стремится к нулю", "DPO оценивает каждый ответ без его промпта, так что ни одно слагаемое не зависит от x", "Слагаемое β·ln Z(x) поглощается коэффициентом β, который всё равно подбирают вручную"],
                        hint: "Что модель Брэдли–Терри делает с двумя наградами пары?",
                        why: "Модель Брэдли–Терри использует только r(y_w) − r(y_l), а промпт x у обоих ответов общий, поэтому два слагаемых β·ln Z(x) сокращаются. Z(x) не зависит от θ, так что обучение её не меняет; а суммирует она по всем возможным ответам, которых слишком много, чтобы их перебрать. Именно это сокращение делает DPO практичным."
                    }
                },
                {
                    type: "info", icon: "🎭",
                    en: {
                        title: "Reward hacking",
                        text: [
                            "A reward model is only a proxy for what people want. Optimised hard against it, a policy can find what the proxy likes but people do not: **reward hacking**. This is Goodhart's law at work: a measure that becomes a target stops being a good measure.",
                            "Reward models often prefer longer answers. Models trained on human approval have been observed to agree with a user's stated views more than the facts allow: **sycophancy**.",
                            "In a 2022 study, a large “gold” reward model stood in for people and labelled the comparisons for a proxy reward model. As optimisation against the proxy moved the policy away from its start, the proxy reward kept rising, while the gold reward rose, peaked and then fell: **over-optimisation**."
                        ],
                        note: "Defences: the KL penalty, stopping early, better reward models retrained on fresh comparisons, and checks by people."
                    },
                    ru: {
                        title: "Взлом награды",
                        text: [
                            "Модель вознаграждения — лишь заменитель (proxy) того, чего хотят люди. При сильной оптимизации по ней политика может найти то, что нравится заменителю, но не людям: это **взлом награды** (reward hacking). Здесь действует закон Гудхарта: мера, ставшая целью, перестаёт быть хорошей мерой.",
                            "Модели вознаграждения часто предпочитают более длинные ответы. У моделей, обученных на одобрении людей, наблюдали склонность соглашаться с высказанными взглядами пользователя сильнее, чем позволяют факты: это **угодничество** (sycophancy).",
                            "В исследовании 2022 года людей заменяла большая «золотая» модель вознаграждения: она размечала сравнения для прокси-модели. Пока оптимизация по прокси-модели уводила политику от исходной, прокси-награда всё росла, а «золотая» росла, достигала пика и затем падала: это **переоптимизация** (over-optimisation)."
                        ],
                        note: "Защита: штраф за KL, ранняя остановка, более качественные модели вознаграждения, заново обученные на свежих сравнениях, и проверки людьми."
                    }
                },
                {
                    type: "sort",
                    en: {
                        q: "A model was optimised against a reward model. Which observations suggest reward hacking, and which a real improvement?",
                        groups: ["Likely reward hacking", "Likely a real gain"],
                        items: [
                            ["Answers became 40% longer, with the same facts in them", 0],
                            ["In a blind test, people prefer the new answers to the old ones", 1],
                            ["The model agrees with a user's wrong claim more often than before", 0],
                            ["More held-out maths problems are solved, checked against known answers", 1],
                            ["The reward model's score rose, while blind human ratings fell", 0],
                            ["Fewer factual errors on held-out questions checked by people", 1]
                        ],
                        why: "A real gain shows up in measurements that the optimisation never saw: blind human judgements, known answers, held-out checks. Hacking shows up as a rising proxy with flat or falling real quality."
                    },
                    ru: {
                        q: "Модель оптимизировали по модели вознаграждения. Какие наблюдения говорят о взломе награды, а какие — о настоящем улучшении?",
                        groups: ["Скорее взлом награды", "Скорее настоящее улучшение"],
                        items: [
                            ["Ответы стали на 40% длиннее, а фактов в них столько же", 0],
                            ["В слепом тесте люди предпочитают новые ответы старым", 1],
                            ["Модель чаще прежнего соглашается с ошибочным утверждением пользователя", 0],
                            ["Решено больше отложенных (held-out) задач по математике, ответы сверены с известными", 1],
                            ["Оценка модели вознаграждения выросла, а слепые оценки людей упали", 0],
                            ["Меньше фактических ошибок на отложенных вопросах, проверенных людьми", 1]
                        ],
                        why: "Настоящее улучшение видно в измерениях, которых оптимизация не видела: в слепых оценках людей, известных ответах, отложенных проверках. Взлом награды выглядит как растущая прокси-награда при неизменном или падающем реальном качестве."
                    }
                },
                {
                    type: "recap",
                    en: {
                        points: [
                            "RLHF learns from comparisons: SFT, then a reward model fitted with Bradley–Terry, `P(y_w ≻ y_l) = σ(r(y_w) − r(y_l))`, then RL, often PPO, with a KL penalty that keeps the policy close to π_ref.",
                            "Only differences of rewards enter Bradley–Terry, so rewards have no fixed zero: adding a constant to every reward changes no prediction. Their scale, though, is fixed through σ.",
                            "The KL-regularised objective `E[r] − β·KL(π ‖ π_ref)` has the exact optimum `π* ∝ π_ref·exp(r/β)`. DPO solves it for r; within a pair Z(x) cancels, and what remains is a loss on the policy itself, with no separate reward model.",
                            "A reward model is only a proxy: optimised too hard, it gets hacked, for example with longer answers or sycophancy. Judge the result on what the optimisation never saw: blind human ratings, known answers, held-out checks."
                        ]
                    },
                    ru: {
                        points: [
                            "RLHF учится на сравнениях: SFT, затем модель вознаграждения по Брэдли–Терри, `P(y_w ≻ y_l) = σ(r(y_w) − r(y_l))`, затем RL, часто PPO, со штрафом за KL, который держит политику близко к π_ref.",
                            "В модель Брэдли–Терри входят только разности наград, поэтому у наград нет фиксированного нуля: прибавка константы ко всем наградам не меняет ни одного предсказания. А вот масштаб задан через σ.",
                            "У целевой функции с KL-регуляризацией `E[r] − β·KL(π ‖ π_ref)` есть точный оптимум `π* ∝ π_ref·exp(r/β)`. DPO выражает из него r; внутри пары Z(x) сокращается, и остаётся функция потерь для самой политики, без отдельной модели вознаграждения.",
                            "Модель вознаграждения — лишь заменитель: при слишком сильной оптимизации её взламывают, например длинными ответами или угодничеством. Оценивай результат по тому, чего оптимизация не видела: по слепым оценкам людей, известным ответам, отложенным проверкам."
                        ]
                    }
                }
            ]
        },

        /* ----- r9. Inside the model: interpretability ----- */
        r9: {
            steps: [
                {
                    type: "info", icon: "🔬", mono: true,
                    en: {
                        title: "Features as directions",
                        text: [
                            "**Mechanistic interpretability** tries to work out, from a trained network's weights and activations, how it computes its output. In a transformer, each position has a vector shared by all layers: every attention and MLP layer reads from it and adds its output to it. This is the **residual stream**.",
                            "The **linear representation hypothesis** says that many concepts, or **features**, are represented as directions in this space. How strongly a feature is present in an activation x is the projection of x on its direction.",
                            "Much evidence supports it: linear classifiers can often read features out of activations, and adding a feature's direction to the activations can often steer the output. But it is a hypothesis, not a law: some features studied lie on circles or other shapes that do not fit in one dimension."
                        ],
                        example: ["strength of feature u in activation x = x · u, where ‖u‖ = 1"]
                    },
                    ru: {
                        title: "Признаки как направления",
                        text: [
                            "**Механистическая интерпретируемость** (mechanistic interpretability) пытается понять по весам и активациям обученной сети, как она вычисляет выход. В трансформере у каждой позиции есть вектор, общий для всех слоёв: каждый слой внимания и MLP читает его и прибавляет к нему свой выход. Это **остаточный поток** (residual stream).",
                            "**Гипотеза линейного представления** (linear representation hypothesis): многие понятия, или **признаки** (features), представлены в этом пространстве направлениями. Насколько сильно признак присутствует в активации x, показывает проекция x на его направление.",
                            "Её многое подтверждает: линейный классификатор часто может извлечь признак из активаций, а прибавив к ним направление признака, часто можно управлять выходом модели. Но это гипотеза, а не закон: некоторые изученные признаки лежат на окружностях или других фигурах, которые не помещаются в одно измерение."
                        ],
                        example: ["сила признака u в активации x = x · u, где ‖u‖ = 1"]
                    }
                },
                {
                    type: "number", answer: 2, tolerance: 0.005,
                    en: {
                        q: "A feature has the unit direction u = (0.6, 0.8), and an activation is x = (2, 1). How strongly is the feature present in x, measured as the projection x·u?",
                        hint: "Multiply the matching components and add the products.",
                        why: "x·u = 2·0.6 + 1·0.8 = 1.2 + 0.8 = 2. Since ‖u‖² = 0.36 + 0.64 = 1, this is the length of the projection of x on u. The rest, x − 2·u = (0.8, −0.6), is orthogonal to u."
                    },
                    ru: {
                        q: "У признака единичное направление u = (0,6; 0,8), а активация равна x = (2; 1). Насколько сильно признак присутствует в x, если мерить проекцией x·u?",
                        hint: "Перемножь соответствующие компоненты и сложи произведения.",
                        why: "x·u = 2·0,6 + 1·0,8 = 1,2 + 0,8 = 2. Так как ‖u‖² = 0,36 + 0,64 = 1, это длина проекции x на u. Остаток x − 2·u = (0,8; −0,6) ортогонален u."
                    }
                },
                {
                    type: "info", icon: "🧶", mono: true,
                    en: {
                        title: "Polysemantic neurons and superposition",
                        text: [
                            "In trained networks, many single neurons respond to several unrelated things. Such a neuron is called **polysemantic**.",
                            "One explanation is **superposition**: a layer stores more features than it has dimensions, as directions that are almost, but not exactly, orthogonal; high dimensions have room for very many of these. Then not every feature can have a neuron of its own, and a neuron can respond to several features.",
                            "Superposition works best when features are **sparse**: each is active on only a small share of inputs, so few are active at once. The price is **interference**: reading one feature by projection also picks up small terms from the other active features."
                        ],
                        example: ["x = Σ_j f_j · u_j: strengths f_j times unit directions u_j", "x · u_i = f_i + Σ_(j≠i) f_j · (u_j · u_i)"]
                    },
                    ru: {
                        title: "Полисемантичные нейроны и суперпозиция",
                        text: [
                            "В обученных сетях многие отдельные нейроны реагируют на несколько не связанных между собой вещей. Такой нейрон называют **полисемантичным**.",
                            "Одно из объяснений — **суперпозиция**: слой хранит больше признаков, чем у него измерений, в виде почти, но не совсем ортогональных направлений, которых в больших размерностях помещается очень много. Тогда не каждому признаку достаётся свой нейрон, и нейрон может откликаться на несколько признаков.",
                            "Лучше всего суперпозиция работает при **разреженности** (sparsity) признаков: каждый активен лишь на малой доле входов, поэтому одновременно активны немногие. Цена — **интерференция** (interference): проекция на направление одного признака захватывает и малые слагаемые от других активных признаков."
                        ],
                        example: ["x = Σ_j f_j · u_j: силы признаков f_j, умноженные на единичные направления u_j", "x · u_i = f_i + Σ_(j≠i) f_j · (u_j · u_i)"]
                    }
                },
                {
                    type: "number", answer: 0.01, tolerance: 0.0005, card: "r9a",
                    en: {
                        q: "The cosine similarity of two independent, uniformly random unit vectors in d = 10,000 dimensions has mean 0 and typical size (standard deviation) 1/√d. What is that typical size?",
                        hint: "√10,000 = 100.",
                        why: "1/√10,000 = 1/100 = 0.01: random directions in high dimensions are almost orthogonal. More generally, the number of directions whose pairwise cosines all lie between −ε and ε, for a fixed small ε, can grow exponentially with d: with ε well above 1/√d, 10,000 dimensions have room for far more than 10,000 such directions."
                    },
                    ru: {
                        q: "Косинусное сходство двух независимых равномерно распределённых единичных векторов в пространстве размерности d = 10 000 имеет среднее 0 и типичный размер (стандартное отклонение) 1/√d. Чему равен этот типичный размер?",
                        hint: "√10 000 = 100.",
                        why: "1/√10 000 = 1/100 = 0,01: случайные направления в больших размерностях почти ортогональны. Вообще, число направлений, у которых все попарные косинусы лежат между −ε и ε при фиксированном малом ε, может расти экспоненциально с d: если ε много больше 1/√d, в 10 000 измерений таких направлений помещается гораздо больше 10 000."
                    }
                },
                {
                    type: "choice", card: "r9b",
                    en: {
                        q: "In superposition, a layer stores more features than it has dimensions, as almost orthogonal directions. Why does this work best when the features are sparse, that is, rarely active?",
                        options: ["Rarely active features are seldom active together, so their small interference rarely adds up to errors", "Sparsity makes the feature directions exactly orthogonal, so they cannot interfere at all", "Sparse features need no direction of their own, so they take up no room in the space", "Only rarely active features can be represented as directions in activation space at all"],
                        hint: "The interference between almost orthogonal directions is small but not zero. When does it cause trouble?",
                        why: "Reading a feature picks up a little interference from every other active feature. With sparse features, few are active at once, so the total stays small and can be filtered out. If most were active together, the interference would add up, and only about as many features as dimensions could be stored reliably."
                    },
                    ru: {
                        q: "При суперпозиции слой хранит больше признаков, чем у него измерений, в виде почти ортогональных направлений. Почему это лучше всего работает, когда признаки разреженные, то есть редко активны?",
                        options: ["Редко активные признаки почти не бывают активны вместе, и их слабая интерференция редко даёт ошибки", "Разреженность делает направления признаков строго ортогональными, и интерференции нет вовсе", "Разреженным признакам не нужно своё направление, поэтому они не занимают места в пространстве", "Только редко активные признаки вообще могут быть представлены направлениями в пространстве активаций"],
                        hint: "Интерференция между почти ортогональными направлениями мала, но не равна нулю. Когда она начинает мешать?",
                        why: "В проекцию на признак попадает малая добавка от каждого другого активного признака. При разреженности одновременно активны немногие, и суммарная добавка мала: её можно отсечь. Будь активно сразу большинство признаков, добавки сложились бы, и надёжно хранить удалось бы лишь примерно столько признаков, сколько измерений."
                    }
                },
                {
                    type: "info", icon: "🔎", mono: true,
                    en: {
                        title: "Sparse autoencoders",
                        text: [
                            "A **sparse autoencoder** (SAE) tries to pull features out of superposition. Trained on a layer's activations x, it encodes each x into a much wider code f of feature strengths and decodes f back into a reconstruction x̂.",
                            "The L1 penalty, with the ReLU, makes most entries of f exactly 0, so each x is rebuilt from a few features. The columns of W_dec form the **dictionary**: candidate feature directions, many of which turn out to be interpretable.",
                            "Limits: some reconstruction error remains, some features never activate (**dead features**), and features can split into finer ones as the dictionary grows."
                        ],
                        example: ["f = ReLU(W_enc · x + b_enc)", "x̂ = W_dec · f = Σ_j f_j · (column j of W_dec)", "loss = ‖x − x̂‖² + λ · ‖f‖₁", "x: 512 numbers → f: 16 · 512 = 8192 features"],
                        note: "The columns of W_dec are usually kept at unit norm, or the penalty is weighted by their norms: otherwise the L1 term could be made as small as you like by scaling f down and W_dec up by the same factor."
                    },
                    ru: {
                        title: "Разреженные автокодировщики",
                        text: [
                            "**Разреженный автокодировщик** (sparse autoencoder, SAE) пытается извлечь признаки из суперпозиции. Его обучают на активациях x одного слоя: он кодирует каждый x в гораздо более широкий код f из сил признаков и декодирует f обратно в реконструкцию x̂.",
                            "Штраф L1 вместе с ReLU делает большинство компонент f равными ровно 0, так что каждый x собирается из немногих признаков. Столбцы W_dec образуют **словарь признаков** (dictionary): это кандидаты в направления признаков, и многие из них оказываются интерпретируемыми.",
                            "Ограничения: остаётся некоторая ошибка реконструкции, часть признаков никогда не активируется (**мёртвые признаки**, dead features), а при росте словаря признаки могут дробиться на более узкие."
                        ],
                        example: ["f = ReLU(W_enc · x + b_enc)", "x̂ = W_dec · f = Σ_j f_j · (столбец j матрицы W_dec)", "функция потерь = ‖x − x̂‖² + λ · ‖f‖₁", "x: 512 чисел → f: 16 · 512 = 8192 признака"],
                        note: "Столбцы W_dec обычно держат единичной длины или умножают штраф на их нормы: иначе член L1 можно было бы сделать сколь угодно малым, уменьшив f и во столько же раз увеличив W_dec."
                    }
                },
                {
                    type: "match",
                    en: {
                        q: "A sparse autoencoder computes f = ReLU(W_enc·x + b_enc) and x̂ = W_dec·f, and is trained on the loss ‖x − x̂‖² + λ·‖f‖₁. Match each part with its role.",
                        pairs: [
                            ["W_enc and the ReLU", "Turn an activation into a code of feature strengths"],
                            ["The columns of W_dec", "Candidate feature directions"],
                            ["λ·‖f‖₁", "Push most feature strengths to zero"],
                            ["‖x − x̂‖²", "Keep the reconstruction close to the activation"]
                        ],
                        why: "The encoder computes the code, and the decoder rebuilds x from its columns. The two loss terms pull against each other: faithful reconstruction wants many active features, the L1 penalty wants few, and λ sets the balance."
                    },
                    ru: {
                        q: "Разреженный автокодировщик вычисляет f = ReLU(W_enc·x + b_enc) и x̂ = W_dec·f, а обучается на функции потерь ‖x − x̂‖² + λ·‖f‖₁. Сопоставь каждую часть с её ролью.",
                        pairs: [
                            ["W_enc и ReLU", "Превратить активацию в код из сил признаков"],
                            ["Столбцы W_dec", "Кандидаты в направления признаков"],
                            ["λ·‖f‖₁", "Прижать большинство сил признаков к нулю"],
                            ["‖x − x̂‖²", "Держать реконструкцию близко к активации"]
                        ],
                        why: "Энкодер вычисляет код, а декодер собирает x из своих столбцов. Два члена функции потерь тянут в разные стороны: точной реконструкции нужно много активных признаков, штрафу L1 — мало, а λ задаёт баланс."
                    }
                },
                {
                    type: "info", icon: "🧪",
                    en: {
                        title: "Decodable is not the same as used",
                        text: [
                            "A **linear probe** is a linear model trained to predict a property from a layer's activations. If it succeeds, the information is linearly present in that layer, but the model may never use it.",
                            "To test use, intervene. **Activation patching** copies one component's activations from a run on one input into a run on another and measures how the output moves. **Ablation** removes a component, for example by setting its output to zero or to its mean over many inputs.",
                            "**Steering** adds a feature direction, a **steering vector**, to the residual stream. In each case, the interpretation is supported only if the output changes as it predicts."
                        ]
                    },
                    ru: {
                        title: "Извлекается — ещё не значит используется",
                        text: [
                            "**Линейный зонд** (linear probe) — это линейная модель, обученная предсказывать свойство по активациям слоя. Если это удаётся, информация линейно доступна в этом слое, но модель может никогда ею не пользоваться.",
                            "Чтобы проверить использование, нужно вмешаться. **Подмена активаций** (activation patching) переносит активации одного компонента из прогона на одном входе в прогон на другом и измеряет, как сдвигается выход. **Абляция** (ablation) убирает компонент: например, заменяет его выход нулём или средним по многим входам.",
                            "**Управление** (steering) прибавляет к остаточному потоку направление признака — **управляющий вектор** (steering vector). В каждом случае интерпретация подтверждается, только если выход меняется так, как она предсказывает."
                        ]
                    }
                },
                {
                    type: "choice", card: "r9c",
                    en: {
                        q: "A linear probe, a linear classifier trained on activations, reads a sentence's sentiment from layer 10 of a language model with 95% accuracy on held-out sentences. What does this show?",
                        options: ["Sentiment is linearly decodable at layer 10; whether the model uses it is not yet shown", "The model relies on layer 10 to decide the sentiment of what it writes next", "A single neuron in layer 10 stores the sentiment, and the probe has found it", "Ablating layer 10 would remove the model's sense of the sentence's sentiment"],
                        hint: "The probe is trained separately from the model. What does its success say about the model itself?",
                        why: "A probe measures what can be read out, not what the model itself reads out. The information may be present but unused, or present in several layers at once. Use is tested by intervening: patch or ablate the probe's direction and see whether the output changes as predicted."
                    },
                    ru: {
                        q: "Линейный зонд (линейный классификатор, обученный на активациях) верно определяет тональность предложения по активациям слоя 10 языковой модели в 95% случаев на отложенных данных. Что это показывает?",
                        options: ["Тональность линейно извлекается из слоя 10; использует ли её модель, пока не показано", "Модель опирается на слой 10, когда решает, какой тональности будет её продолжение", "Тональность хранится в одном нейроне слоя 10, и зонд нашёл этот нейрон", "Абляция слоя 10 лишила бы модель способности различать тональность предложения"],
                        hint: "Зонд обучают отдельно от модели. Что его успех говорит о самой модели?",
                        why: "Зонд измеряет, что можно извлечь из активаций, а не что извлекает из них сама модель. Информация может присутствовать и не использоваться или присутствовать сразу в нескольких слоях. Использование проверяют вмешательством: подменяют или убирают направление зонда и смотрят, меняется ли выход так, как предсказано."
                    }
                },
                {
                    type: "info", icon: "🔁",
                    en: {
                        title: "Induction heads",
                        text: [
                            "A **circuit** is a small set of components that together carry out one computation. A well-studied one uses two attention heads in different layers. A **previous-token head** in the earlier layer writes, at each position, information about the token just before it.",
                            "An **induction head** in the later layer, at the current token A, uses that information to find the positions right after earlier occurrences of A, attends to them and copies the token found there. So after [A][B] … [A] it predicts [B].",
                            "In the models studied, induction heads formed during a short phase of training that coincided with a sharp improvement in **in-context learning**: predicting later tokens better by using earlier parts of the same context."
                        ]
                    },
                    ru: {
                        title: "Индукционные головы",
                        text: [
                            "**Схема** (circuit) — небольшой набор компонентов, которые вместе выполняют одно вычисление. Одна из хорошо изученных схем состоит из двух голов внимания в разных слоях. **Голова предыдущего токена** (previous-token head) в более раннем слое записывает в каждую позицию сведения о токене прямо перед ней.",
                            "**Индукционная голова** (induction head) в более позднем слое, стоя на текущем токене A, по этим сведениям находит позиции сразу после прежних вхождений A, смотрит на них и копирует найденный там токен. Поэтому после [A][B] … [A] она предсказывает [B].",
                            "В изученных моделях индукционные головы сформировались за короткую фазу обучения, совпавшую с резким улучшением **обучения в контексте** (in-context learning) — умения лучше предсказывать дальнейшие токены, опираясь на более ранние части того же контекста."
                        ]
                    }
                },
                {
                    type: "choice", card: "r9d",
                    en: {
                        q: "The text so far is “blue kettle … red sofa … blue”, where each word is one token and … stands for other text. Which next token does an induction head make more likely?",
                        options: ["kettle: it attends to the token after the earlier “blue” and copies it", "sofa: it attends to the most recent noun in the text and copies it", "red: it attends to the colour word before the current one and copies it", "blue: it attends to the earlier “blue” itself and copies that token"],
                        hint: "An induction head completes a pattern that has already appeared in the context.",
                        why: "The head finds the earlier occurrence of the current token and copies the token that followed it: [A][B] … [A] → [B], with A = blue and B = kettle. Recency, similar meaning and repeating the current token play no part in this rule."
                    },
                    ru: {
                        q: "Текст пока такой: «синий чайник … красный диван … синий», где каждое слово — один токен, а … — другой текст. Вероятность какого следующего токена повышает индукционная голова?",
                        options: ["чайник: она смотрит на токен после прежнего слова «синий» и копирует его", "диван: она смотрит на последнее существительное в тексте и копирует его", "красный: она смотрит на слово-цвет перед текущим и копирует его", "синий: она смотрит на само прежнее слово «синий» и копирует его"],
                        hint: "Индукционная голова продолжает шаблон, который уже встречался в контексте.",
                        why: "Голова находит прежнее вхождение текущего токена и копирует токен, который шёл за ним: [A][B] … [A] → [B], здесь A = синий и B = чайник. Ни близость к концу текста, ни сходство по смыслу, ни повтор текущего токена в этом правиле роли не играют."
                    }
                },
                {
                    type: "recap",
                    en: {
                        points: [
                            "Many features appear to be directions in the residual stream; a feature's strength in x is the projection `x·u` on its unit direction u. This is a well-supported hypothesis, not a law: some features are not one-dimensional.",
                            "Superposition, one explanation of polysemantic neurons, packs more features than dimensions into almost orthogonal directions: random directions in d dimensions have cosines of typical size 1/√d. It works best when features are sparse; the price is a little interference.",
                            "A sparse autoencoder learns a wide dictionary of candidate feature directions with the loss `‖x − x̂‖² + λ·‖f‖₁`: reconstruction plus an L1 penalty that keeps the code sparse.",
                            "A probe shows what is decodable; an intervention (patching, ablation, steering) shows what is used. An induction head, with a previous-token head, forms a circuit for `[A][B] … [A] → [B]` that is linked to in-context learning."
                        ]
                    },
                    ru: {
                        points: [
                            "Многие признаки, судя по всему, представлены направлениями в остаточном потоке, а сила признака в x — это проекция `x·u` на его единичное направление u. Это хорошо подтверждённая гипотеза, а не закон: некоторые признаки не одномерны.",
                            "Суперпозиция, одно из объяснений полисемантичных нейронов, укладывает больше признаков, чем измерений, в почти ортогональные направления: у случайных направлений в d измерениях косинус порядка 1/√d. Лучше всего она работает при разреженных признаках; цена — небольшая интерференция.",
                            "Разреженный автокодировщик выучивает широкий словарь кандидатов в направления признаков с функцией потерь `‖x − x̂‖² + λ·‖f‖₁`: реконструкция плюс штраф L1, который делает код разреженным.",
                            "Зонд показывает, что извлекается, а вмешательство (подмена активаций, абляция, управление) — что используется. Индукционная голова вместе с головой предыдущего токена образует схему `[A][B] … [A] → [B]`, связанную с обучением в контексте."
                        ]
                    }
                }
            ]
        },

        /* ----- r10. Smaller and faster models ----- */
        r10: {
            steps: [
                {
                    type: "info", icon: "💾",
                    en: {
                        title: "Memory = parameters × bytes",
                        text: [
                            "Memory for the weights = number of parameters × bytes per parameter. A model with 7 billion parameters in 16-bit numbers needs 7·10⁹ · 2 bytes = 14 GB (1 GB = 10⁹ bytes).",
                            "When a dense model decodes a single sequence, every new token requires reading every weight once, so the speed is limited by memory bandwidth. Fewer bytes per parameter therefore mean less memory and, usually, faster decoding.",
                            "**Quantisation** stores the weights, and sometimes the activations, as numbers with fewer bits: for example 8 or 4 instead of 16."
                        ],
                        table: { side: true, head: ["Precision", "Bytes per parameter"], rows: [["32-bit", "4"], ["16-bit", "2"], ["8-bit", "1"], ["4-bit", "0.5"]] }
                    },
                    ru: {
                        title: "Память = параметры × байты",
                        text: [
                            "Память под веса = число параметров × байты на параметр. Модели с 7 миллиардами параметров в 16-битных числах нужно 7·10⁹ · 2 байта = 14 ГБ (1 ГБ = 10⁹ байт).",
                            "Когда плотная модель декодирует одну последовательность, для каждого нового токена каждый вес читается один раз, поэтому скорость упирается в пропускную способность памяти. Значит, чем меньше байт на параметр, тем меньше нужно памяти и, как правило, тем быстрее декодирование.",
                            "**Квантование** (quantisation) — это хранение весов, а иногда и активаций, в более коротких числах: например, в 8- или 4-битных вместо 16-битных."
                        ],
                        table: { side: true, head: ["Точность", "Байт на параметр"], rows: [["32 бита", "4"], ["16 бит", "2"], ["8 бит", "1"], ["4 бита", "0,5"]] }
                    }
                },
                {
                    type: "number", answer: 3.5, tolerance: 0.05, card: "r10a",
                    en: {
                        q: "A model has 7 billion parameters, each stored as a 4-bit number. How many GB do these numbers take? (1 GB = 10⁹ bytes)",
                        hint: "How many bytes are 4 bits?",
                        why: "4 bits = 0.5 byte, so 7·10⁹ · 0.5 bytes = 3.5·10⁹ bytes = 3.5 GB: a quarter of the 14 GB that the same model needs in 16-bit numbers. Quantised formats also store scale factors, which add a little on top."
                    },
                    ru: {
                        q: "У модели 7 миллиардов параметров, и каждый хранится как 4-битное число. Сколько ГБ занимают эти числа? (1 ГБ = 10⁹ байт)",
                        hint: "Сколько байт в 4 битах?",
                        why: "4 бита = 0,5 байта, поэтому 7·10⁹ · 0,5 байта = 3,5·10⁹ байт = 3,5 ГБ — вчетверо меньше, чем 14 ГБ у той же модели в 16-битных числах. Квантованные форматы хранят ещё и масштабные множители, а это добавляет немного памяти."
                    }
                },
                {
                    type: "info", icon: "📏", mono: true,
                    en: {
                        title: "Absmax quantisation",
                        text: [
                            "The simplest way to turn weights into 8-bit integers uses one **scale** s for a whole block of weights, for example a whole matrix. The scale is chosen so that the weight with the largest absolute value maps to ±127: this is **absmax** quantisation.",
                            "Each weight w is stored as an integer code q, and computations use the value ŵ = q · s."
                        ],
                        example: ["s = max|w| / 127", "q = round(w / s), an integer from −127 to 127", "ŵ = q · s", "max|w| = 2.54 → s = 0.02", "w = 0.713 → q = round(35.65) = 36 → ŵ = 0.72"],
                        note: "The rounding error |w − ŵ| is never more than s/2: here 0.007 ≤ 0.01."
                    },
                    ru: {
                        title: "Квантование по максимуму модуля",
                        text: [
                            "Самый простой способ превратить веса в 8-битные целые числа — один **масштаб** (scale) s на целый блок весов, например на всю матрицу. Масштаб выбирают так, чтобы наибольший по модулю вес перешёл в ±127: это **квантование по максимуму модуля** (absmax).",
                            "Каждый вес w хранится как целочисленный код q, а в вычислениях используется значение ŵ = q · s."
                        ],
                        example: ["s = max|w| / 127", "q = round(w / s) — целое число от −127 до 127", "ŵ = q · s", "max|w| = 2,54 → s = 0,02", "w = 0,713 → q = round(35,65) = 36 → ŵ = 0,72"],
                        note: "Ошибка округления |w − ŵ| никогда не превышает s/2: здесь 0,007 ≤ 0,01."
                    }
                },
                {
                    type: "number", answer: -65,
                    en: {
                        q: "Weights are quantised to 8-bit integers with the absmax rule: s = max|w| / 127 and q = round(w / s). In the block, max|w| = 2.54. What is the integer code q of the weight w = −1.30?",
                        hint: "Find the scale s first.",
                        why: "s = 2.54 / 127 = 0.02, and −1.30 / 0.02 = −65 exactly, so q = −65. No rounding was needed, so ŵ = −65 · 0.02 = −1.30: this weight comes back without any error."
                    },
                    ru: {
                        q: "Веса квантуют в 8-битные целые числа по максимуму модуля: s = max|w| / 127 и q = round(w / s). В блоке max|w| = 2,54. Чему равен целочисленный код q веса w = −1,30?",
                        hint: "Сначала найди масштаб s.",
                        why: "s = 2,54 / 127 = 0,02, а −1,30 / 0,02 = ровно −65, так что q = −65. Округлять ничего не пришлось, поэтому ŵ = −65 · 0,02 = −1,30: этот вес восстанавливается без ошибки."
                    }
                },
                {
                    type: "info", icon: "🌋",
                    en: {
                        title: "One outlier spoils the scale",
                        text: [
                            "Now let one weight in the block be an **outlier**, far larger in size than the rest: 25.4. The scale becomes 25.4 / 127 = 0.2, so every weight with |w| < 0.1 gets |w / s| < 0.5 and is rounded to q = 0. If most weights are that small, most of the block's information is lost.",
                            "Remedies: **per-channel** scales, one for each row (output channel) of a weight matrix; **group-wise** scales, one for each small group of neighbouring weights, for example 128 of them; and keeping the rare outliers in higher precision.",
                            "In large transformers, a few channels of the activations can be far larger than the rest: one reason why activations are usually harder to quantise than weights."
                        ]
                    },
                    ru: {
                        title: "Один выброс портит масштаб",
                        text: [
                            "Пусть теперь один вес в блоке — **выброс** (outlier), намного больше остальных по модулю: 25,4. Масштаб становится 25,4 / 127 = 0,2, и у каждого веса с |w| < 0,1 получается |w / s| < 0,5: он округляется до q = 0. Если таких малых весов большинство, теряется большая часть информации блока.",
                            "Что помогает: **поканальные масштабы** (per-channel) — свой для каждой строки (выходного канала) матрицы весов; **групповые масштабы** (group-wise) — свой для каждой небольшой группы соседних весов, например из 128; и хранение редких выбросов с более высокой точностью.",
                            "В больших трансформерах несколько каналов активаций могут быть намного больше остальных: это одна из причин, по которым активации обычно труднее квантовать, чем веса."
                        ]
                    }
                },
                {
                    type: "number", answer: 4.125, tolerance: 0.0005, card: "r10b",
                    en: {
                        q: "Weights are stored as 4-bit numbers in groups of 128, and each group also stores its own 16-bit scale. Counting the scales, how many bits does one weight take on average?",
                        hint: "Share the 16 bits of a scale among the 128 weights of its group.",
                        why: "4 + 16 / 128 = 4 + 0.125 = 4.125 bits per weight. Smaller groups usually give a smaller rounding error, since one large weight then spoils fewer neighbours, but they cost more: groups of 32 would need 4 + 16 / 32 = 4.5 bits."
                    },
                    ru: {
                        q: "Веса хранятся 4-битными числами в группах по 128, и у каждой группы есть ещё свой 16-битный масштаб. Сколько бит в среднем приходится на один вес с учётом масштабов?",
                        hint: "Раздели 16 бит масштаба между 128 весами его группы.",
                        why: "4 + 16 / 128 = 4 + 0,125 = 4,125 бита на вес. Группы поменьше обычно дают меньшую ошибку округления, ведь один крупный вес портит тогда меньше соседей, но стоят дороже: при группах по 32 нужно 4 + 16 / 32 = 4,5 бита."
                    }
                },
                {
                    type: "info", icon: "🧠",
                    en: {
                        title: "Mixture of experts",
                        text: [
                            "A **mixture of experts** (MoE) replaces the feed-forward (MLP) block of a transformer layer with E **experts**, each a feed-forward network of its own.",
                            "A **router**, a small learned layer, scores the experts for each token and sends the token to the k with the highest scores. Their outputs are added up, with weights also given by the router.",
                            "The **active parameters** are the ones a token actually uses: the shared parts, such as the attention layers, plus its k experts. The compute per token grows with the active parameters, but the memory must hold all of them."
                        ],
                        note: "On its own, the router can learn to send most tokens to a few experts. An extra **load-balancing loss** helps keep the experts evenly used."
                    },
                    ru: {
                        title: "Смесь экспертов",
                        text: [
                            "**Смесь экспертов** (mixture of experts, MoE) заменяет полносвязный блок (MLP) слоя трансформера на E **экспертов**, каждый из которых — отдельная полносвязная сеть.",
                            "**Маршрутизатор** (router), небольшой обучаемый слой, оценивает экспертов для каждого токена и отправляет токен к k экспертам с наибольшими оценками. Их выходы складываются с весами, которые тоже даёт маршрутизатор.",
                            "**Активные параметры** — те, которые токен действительно использует: общие части, например слои внимания, плюс его k экспертов. Объём вычислений на токен растёт с числом активных параметров, но в памяти нужно держать все."
                        ],
                        note: "Без дополнительных мер маршрутизатор может научиться отправлять большинство токенов к немногим экспертам. Дополнительная **функция потерь для балансировки нагрузки** (load-balancing loss) помогает загружать экспертов равномерно."
                    }
                },
                {
                    type: "number", answer: 5, card: "r10c",
                    en: {
                        q: "A mixture-of-experts model has 2 billion shared parameters and 8 experts of 1.5 billion parameters each. Each token goes to its top 2 experts. How many billion parameters are active, that is, used to process one token?",
                        hint: "The shared parameters, plus the two chosen experts.",
                        why: "2 + 2 · 1.5 = 5 billion parameters are active per token, out of 2 + 8 · 1.5 = 14 billion in total. The compute per token is close to that of a dense model with 5 billion parameters, but the memory must hold all 14 billion."
                    },
                    ru: {
                        q: "В модели со смесью экспертов 2 миллиарда общих параметров и 8 экспертов по 1,5 миллиарда. Каждый токен идёт к своим 2 лучшим экспертам. Сколько миллиардов параметров активны, то есть участвуют в обработке одного токена?",
                        hint: "Общие параметры плюс два выбранных эксперта.",
                        why: "Для каждого токена активны 2 + 2 · 1,5 = 5 миллиардов параметров из 2 + 8 · 1,5 = 14 миллиардов. Вычислений на токен почти столько же, сколько у плотной модели с 5 миллиардами параметров, но в памяти нужно держать все 14 миллиардов."
                    }
                },
                {
                    type: "info", icon: "🏎️", mono: true,
                    en: {
                        title: "Speculative decoding",
                        text: [
                            "In **speculative decoding**, a small, fast **draft model** samples the next k tokens one by one from its distribution q. The big model then computes its own distribution p at all k positions, and at one more after them, in a single forward pass.",
                            "For one sequence, that pass takes about as long as generating a single token: decoding is limited by memory traffic, and the weights are read once for all k + 1 positions.",
                            "The drafted tokens are checked in order by the rule below, a form of rejection sampling that makes the output follow p exactly. At the first rejection, a corrected token is drawn and the rest of the draft is dropped; if all k are accepted, the extra position yields one more token."
                        ],
                        example: ["accept drafted token x with probability min(1, p(x) / q(x))", "on the first rejection: draw the token from max(0, p − q), renormalised", "expected tokens per pass of the big model = (1 − α^(k+1)) / (1 − α)", "α = 0.5, k = 3 → (1 − 0.0625) / 0.5 = 1.875"],
                        note: "α is the chance that a drafted token is accepted, here assumed equal for all tokens and independent. The expected count is 1 + α + … + α^k: the accepted tokens plus the corrected or extra one."
                    },
                    ru: {
                        title: "Спекулятивное декодирование",
                        text: [
                            "При **спекулятивном декодировании** (speculative decoding) маленькая быстрая **черновая модель** (draft model) сэмплирует k следующих токенов по одному из своего распределения q. Затем большая модель за один прямой проход вычисляет своё распределение p во всех k позициях и ещё в одной, после них.",
                            "Для одной последовательности такой проход занимает примерно столько же времени, сколько генерация одного токена: декодирование упирается в трафик памяти, а веса читаются один раз сразу для всех k + 1 позиций.",
                            "Черновые токены проверяют один за другим по правилу ниже — это разновидность выборки с отклонением (rejection sampling), и выход распределён в точности по p. При первом отказе выбирают исправленный токен, а остаток черновика отбрасывают; если приняты все k, дополнительная позиция даёт ещё один токен."
                        ],
                        example: ["принять черновой токен x с вероятностью min(1, p(x) / q(x))", "при первом отказе: выбрать токен из max(0, p − q), перенормировав", "ожидаемое число токенов за проход большой модели = (1 − α^(k+1)) / (1 − α)", "α = 0,5; k = 3 → (1 − 0,0625) / 0,5 = 1,875"],
                        note: "α — вероятность того, что черновой токен примут; здесь она считается одинаковой для всех токенов и независимой. Ожидаемое число токенов равно 1 + α + … + α^k: принятые токены плюс исправленный или дополнительный."
                    }
                },
                {
                    type: "choice", card: "r10d",
                    en: {
                        q: "In speculative decoding, a small draft model proposes tokens, and a big model checks them with the standard probabilistic acceptance rule. How does the resulting text compare with text sampled from the big model alone?",
                        options: ["It follows the big model's distribution exactly; only the speed changes", "It follows the draft model's distribution, slightly corrected by the big one", "It is greedy: only the most likely token is kept at each step", "Its quality lies somewhere between that of the two models"],
                        hint: "Add up the two ways a token x can come out: accepted from the draft, or drawn after a rejection.",
                        why: "Let p be the big model's distribution and q the draft's. Acceptance emits x with probability q(x) · min(1, p(x)/q(x)) = min(p(x), q(x)). Rejections, of total probability Σ max(0, p − q), are resampled from max(0, p − q) renormalised, which adds max(0, p(x) − q(x)). The sum is p(x). A poor draft costs speed, never quality."
                    },
                    ru: {
                        q: "При спекулятивном декодировании маленькая черновая модель предлагает токены, а большая проверяет их по стандартному вероятностному правилу. Чем полученный текст отличается от текста, сэмплированного из одной большой модели?",
                        options: ["Он следует распределению большой модели в точности; меняется лишь скорость", "Он следует распределению черновой модели, слегка поправленному большой", "Он жадный: на каждом шаге остаётся лишь самый вероятный токен", "По качеству он где-то посередине между двумя моделями"],
                        hint: "Сложи два пути, которыми может появиться токен x: его приняли из черновика или выбрали после отказа.",
                        why: "Пусть p — распределение большой модели, q — черновой. Принятие даёт x с вероятностью q(x) · min(1, p(x)/q(x)) = min(p(x), q(x)). После отказа (его вероятность Σ max(0, p − q)) токен берут из перенормированного max(0, p − q), что добавляет max(0, p(x) − q(x)). В сумме p(x). Плохой черновик снижает скорость, но не качество."
                    }
                },
                {
                    type: "info", icon: "👩‍🏫",
                    en: {
                        title: "Distillation",
                        text: [
                            "In **distillation**, a small **student** model is trained to match the whole output distribution of a large **teacher** model, not only the right answer. Both distributions are often softened with a temperature T > 1: the logits are divided by T before the softmax.",
                            "The teacher's probabilities, the **soft targets**, carry information that a **one-hot label** (1 for the right class, 0 for all others) lacks. If the teacher finds a cat photo a little like a dog and not at all like a truck, the student learns how the classes relate."
                        ],
                        note: "The student's loss often mixes the usual cross-entropy with the true labels and a term that pulls its softened distribution towards the teacher's."
                    },
                    ru: {
                        title: "Дистилляция",
                        text: [
                            "При **дистилляции** (distillation) маленькую **модель-ученика** (student) обучают воспроизводить всё выходное распределение большой **модели-учителя** (teacher), а не только правильный ответ. Оба распределения часто смягчают температурой T > 1: логиты делят на T перед softmax.",
                            "Вероятности учителя — **мягкие метки** (soft targets) — несут информацию, которой нет в **one-hot-метке** (1 у правильного класса, 0 у остальных). Если учитель считает фото кошки немного похожим на собаку и совсем не похожим на грузовик, ученик узнаёт, как связаны классы."
                        ],
                        note: "Функция потерь ученика часто складывается из обычной перекрёстной энтропии с истинными метками и слагаемого, которое тянет его смягчённое распределение к распределению учителя."
                    }
                },
                {
                    type: "choice",
                    en: {
                        q: "Why can soft targets from a teacher model teach a student more than the true labels alone?",
                        options: ["They also show how alike the input is to each wrong class", "The teacher's outputs are always correct, unlike labels written by people", "They let the student copy the teacher's weights, not just its answers", "They give the right class a higher probability than a one-hot label does"],
                        hint: "What does a one-hot label say about the classes that are wrong?",
                        why: "A one-hot label only says which class is right. The teacher's distribution also says how alike the input is to every wrong class, so each example carries much more information, and the student often learns faster and generalises better. The teacher can be wrong, and it passes on outputs, not weights."
                    },
                    ru: {
                        q: "Почему мягкие метки модели-учителя могут научить ученика большему, чем одни истинные метки?",
                        options: ["Они показывают ещё и сходство входа с каждым неверным классом", "Ответы учителя всегда верны, в отличие от меток, которые ставили люди", "Они позволяют ученику скопировать веса учителя, а не только его ответы", "Они дают правильному классу вероятность выше, чем one-hot-метка"],
                        hint: "Что one-hot-метка говорит о неправильных классах?",
                        why: "One-hot-метка сообщает только, какой класс правильный. Распределение учителя показывает ещё, насколько вход похож на каждый неверный класс, поэтому каждый пример несёт гораздо больше информации, и ученик часто учится быстрее и лучше обобщает. Учитель может ошибаться и передаёт выходы, а не веса."
                    }
                },
                {
                    type: "recap",
                    en: {
                        points: [
                            "`memory of weights = parameters × bytes per parameter`: 7 billion parameters take 14 GB in 16-bit numbers and 3.5 GB in 4-bit ones. Decoding a single sequence is limited by memory bandwidth, so quantisation usually makes it faster too.",
                            "8-bit absmax quantisation stores `round(w / s)` with `s = max|w| / 127`. One outlier coarsens the scale of its whole block, hence per-channel and group-wise scales: 4-bit weights in groups of 128 with a 16-bit scale cost `4 + 16/128 = 4.125` bits each.",
                            "A mixture of experts uses only its active parameters for each token, the shared parts plus that token's top k experts, but must store all of them.",
                            "Speculative decoding can speed up generation without changing the big model's distribution: a poor draft costs speed, never quality. Distillation trains a student on a teacher's soft targets, which also show how alike the input is to each wrong class."
                        ]
                    },
                    ru: {
                        points: [
                            "`память под веса = параметры × байты на параметр`: 7 миллиардов параметров занимают 14 ГБ в 16-битных числах и 3,5 ГБ в 4-битных. Декодирование одной последовательности упирается в пропускную способность памяти, поэтому квантование обычно ещё и ускоряет его.",
                            "8-битное квантование по максимуму модуля хранит `round(w / s)` при `s = max|w| / 127`. Один выброс огрубляет масштаб всего блока, отсюда поканальные и групповые масштабы: 4-битные веса в группах по 128 с 16-битным масштабом стоят `4 + 16/128 = 4,125` бита на вес.",
                            "Смесь экспертов использует для каждого токена только активные параметры — общие части плюс k лучших для него экспертов, — но хранить ей нужно все параметры.",
                            "Спекулятивное декодирование может ускорить генерацию, не меняя распределения большой модели: плохая черновая модель снижает скорость, но не качество. Дистилляция обучает ученика на мягких метках учителя, которые показывают ещё и сходство входа с каждым неверным классом."
                        ]
                    }
                }
            ]
        },

        /* ----- r11. Reasoning and test-time compute ----- */
        r11: {
            steps: [
                {
                    type: "info", icon: "🧠",
                    en: {
                        title: "Thinking takes tokens",
                        text: [
                            "A transformer with a fixed number of layers produces each token with one pass through those layers: a fixed number of serial steps, however hard the problem is.",
                            "Every token it writes is fed back as input. So writing out intermediate steps, a **chain of thought**, gives the model more serial steps of computation for one answer: each pass can build on the results of the passes before it.",
                            "Theoretical work shows that, under standard assumptions of complexity theory, enough such steps let transformers of fixed depth solve problems they cannot solve when they answer at once. The computation a model spends while answering, rather than in training, is its **test-time compute**."
                        ]
                    },
                    ru: {
                        title: "Чтобы думать, нужны токены",
                        text: [
                            "Трансформер с фиксированным числом слоёв выдаёт каждый токен за один проход через эти слои: число последовательных шагов фиксировано, как бы трудна ни была задача.",
                            "Каждый написанный токен снова подаётся на вход. Поэтому, записывая промежуточные шаги — **цепочку рассуждений** (chain of thought), — модель получает больше последовательных шагов вычисления на один ответ: каждый проход может опираться на результаты предыдущих.",
                            "Теоретические работы показывают: при стандартных предположениях теории сложности трансформер фиксированной глубины с достаточным числом таких шагов решает задачи, которые не может решить, отвечая сразу. Вычисления, которые модель тратит на ответ, а не на обучение, — это **вычисления во время ответа** (test-time compute)."
                        ]
                    }
                },
                {
                    type: "choice", card: "r11a",
                    en: {
                        q: "Why can writing out intermediate steps before the final answer help a transformer solve a problem that needs many steps in sequence?",
                        options: ["Each written token is fed back as input, giving more serial computation than one pass through the layers", "Writing the steps updates the model's weights during the answer, so it learns what the problem needs", "Longer outputs receive more total attention weight in the softmax, so the model attends more strongly", "Writing the steps lets each token use more of the model's parameters than a direct answer does"],
                        hint: "What happens to each token after the model has written it?",
                        why: "The weights do not change during an answer, and each token still gets one pass through the same layers. What grows is the number of passes: each written token carries a result into the next pass, so later steps build on earlier ones. Each query's attention weights sum to 1, however long the text is."
                    },
                    ru: {
                        q: "Почему трансформеру может помочь запись промежуточных шагов перед окончательным ответом, если задача требует многих последовательных шагов?",
                        options: ["Каждый написанный токен снова идёт на вход: последовательных вычислений больше, чем за один проход по слоям", "Записанные шаги меняют веса модели прямо во время ответа, и она выучивает то, что нужно для задачи", "Длинный ответ получает больше суммарного веса внимания в softmax, и модель сосредоточивается сильнее", "Записанные шаги позволяют каждому токену задействовать больше параметров модели, чем при прямом ответе"],
                        hint: "Что происходит с каждым токеном после того, как модель его написала?",
                        why: "Веса модели во время ответа не меняются, и каждый токен по-прежнему проходит один раз через те же слои. Растёт число проходов: каждый написанный токен переносит результат в следующий проход, и поздние шаги опираются на ранние. Веса внимания каждого запроса в сумме дают 1, каким бы длинным ни был текст."
                    }
                },
                {
                    type: "info", icon: "🗳️", mono: true,
                    en: {
                        title: "Sample many, take a vote",
                        text: [
                            "Test-time compute can also be spent in parallel. **Self-consistency** samples several chains of thought for one problem at a temperature above 0, so that they differ, and takes a **majority vote**: it returns the most common final answer.",
                            "If the samples were independent and each was right with probability p > 0.5, the chance that more than half of them are right would tend to 1 as their number grows. Real errors are often correlated, with the same wrong idea in many samples, so the gain is usually smaller than this promises."
                        ],
                        example: ["P(majority of 3 right) = p³ + 3·p²·(1 − p)", "p³: all 3 right; 3·p²·(1 − p): exactly 2 right"],
                        note: "When the wrong answers differ from one another, the right one can win the vote with fewer than half of the samples."
                    },
                    ru: {
                        title: "Сэмплируй много — решай голосованием",
                        text: [
                            "Вычисления во время ответа можно тратить и параллельно. **Самосогласованность** (self-consistency): для одной задачи сэмплируют несколько цепочек рассуждений при температуре выше 0, чтобы они различались, и проводят **голосование большинством** (majority vote), то есть выдают самый частый окончательный ответ.",
                            "Если бы ответы были независимы и каждый был верен с вероятностью p > 0,5, вероятность того, что верны больше половины из них, стремилась бы к 1 с ростом их числа. Но реальные ошибки часто коррелированы — одна и та же неверная идея во многих ответах, — поэтому выигрыш обычно меньше, чем обещает такой расчёт."
                        ],
                        example: ["P(верно большинство из 3) = p³ + 3·p²·(1 − p)", "p³: верны все 3; 3·p²·(1 − p): верны ровно 2"],
                        note: "Если неверные ответы расходятся между собой, верный может победить в голосовании, набрав меньше половины голосов."
                    }
                },
                {
                    type: "number", answer: 0.648, tolerance: 0.0005, share: true, card: "r11b",
                    en: {
                        q: "Each sampled answer to a problem is right with probability 0.6, independently of the others. What is the probability that the majority of 3 such samples is right?",
                        hint: "The majority is right when all 3 are right or exactly 2 are. In how many places can the single wrong one be?",
                        why: "P(all 3 right) = 0.6³ = 0.216. P(exactly 2 right) = 3·0.6²·0.4 = 3·0.36·0.4 = 0.432, since the wrong one can be any of the 3. Together 0.648: better than 0.6 from a single sample if the errors are independent."
                    },
                    ru: {
                        q: "Каждый сэмплированный ответ на задачу верен с вероятностью 0,6 независимо от остальных. С какой вероятностью верно большинство из 3 таких ответов?",
                        hint: "Большинство верно, если верны все 3 или ровно 2. На скольких местах может оказаться единственный неверный ответ?",
                        why: "P(верны все 3) = 0,6³ = 0,216. P(верны ровно 2) = 3·0,6²·0,4 = 3·0,36·0,4 = 0,432: неверным может оказаться любой из трёх. Вместе 0,648 — лучше, чем 0,6 у одного ответа, если ошибки независимы."
                    }
                },
                {
                    type: "info", icon: "✅", mono: true,
                    en: {
                        title: "If you can check, sample more",
                        text: [
                            "Some answers can be checked reliably: a proof by a proof checker, a final number against a known answer, code by thorough tests. Then no vote is needed: sample n answers and keep one that passes the check. This is **best-of-n** with a perfect checker.",
                            "It succeeds whenever at least one sample is right. The chance that all n are wrong is (1 − p)^n, which shrinks exponentially with n."
                        ],
                        example: ["P(at least one right among n) = 1 − (1 − p)^n", "n independent samples, each right with probability p"],
                        note: "Sampling cannot find what the model never produces: if p = 0, no n helps."
                    },
                    ru: {
                        title: "Если можно проверить, сэмплируй больше",
                        text: [
                            "Некоторые ответы можно надёжно проверить: доказательство — программой проверки доказательств, итоговое число — по известному ответу, код — тщательными тестами. Тогда голосование не нужно: сэмплируют n ответов и оставляют тот, что прошёл проверку. Это **лучший из n** (best-of-n) с идеальной проверкой.",
                            "Такой способ срабатывает, если верен хотя бы один ответ. Вероятность того, что все n неверны, равна (1 − p)^n и убывает с ростом n экспоненциально."
                        ],
                        example: ["P(хотя бы один верен из n) = 1 − (1 − p)^n", "n независимых ответов, каждый верен с вероятностью p"],
                        note: "Сэмплирование не найдёт того, чего модель никогда не выдаёт: при p = 0 не поможет никакое n."
                    }
                },
                {
                    type: "number", answer: 0.875, tolerance: 0.0005, share: true, card: "r11c",
                    en: {
                        q: "Each sampled solution to a problem is right with probability 0.5, independently of the others, and a perfect checker recognises a right one. What is the probability that at least one of 3 samples is right?",
                        hint: "First find the probability that all 3 are wrong.",
                        why: "All 3 wrong: 0.5³ = 0.125, so at least one right: 1 − 0.125 = 0.875, and the checker picks it out. Three tries turn 0.5 into 0.875. Without a checker, the chance that a majority of the 3 is right would be only 0.125 + 3·0.125 = 0.5."
                    },
                    ru: {
                        q: "Каждое сэмплированное решение задачи верно с вероятностью 0,5 независимо от остальных, а идеальная проверка распознаёт верное. С какой вероятностью среди 3 таких решений есть хотя бы одно верное?",
                        hint: "Сначала найди вероятность того, что все 3 неверны.",
                        why: "Все 3 неверны: 0,5³ = 0,125, значит, хотя бы одно верно: 1 − 0,125 = 0,875, и проверка его найдёт. Три попытки превращают 0,5 в 0,875. Без проверки вероятность того, что верно большинство из 3, была бы лишь 0,125 + 3·0,125 = 0,5."
                    }
                },
                {
                    type: "info", icon: "⚖️",
                    en: {
                        title: "A learned verifier can be fooled",
                        text: [
                            "Without a perfect check, a learned **verifier**, a reward model trained to score solutions, ranks the n samples, and best-of-n keeps the top one.",
                            "As n grows, the top sample is more and more likely to owe its rank to the verifier's errors rather than to being right, so the gains can stop or even reverse.",
                            "An **outcome reward** scores only the final answer: it comes from an outcome reward model or from a check against a known answer. A **process reward** scores each step and usually comes from a process reward model."
                        ],
                        note: "In one 2023 study on maths problems, a verifier trained on step-by-step labels from people chose right solutions more reliably than one trained on final answers only."
                    },
                    ru: {
                        title: "Обученный верификатор можно обмануть",
                        text: [
                            "Без идеальной проверки n сэмплов ранжирует обученный **верификатор** (verifier), или проверяющая модель: модель вознаграждения, обученная оценивать решения. Лучший из n оставляет сэмпл с самой высокой оценкой.",
                            "С ростом n этот сэмпл всё чаще оказывается первым из-за ошибок верификатора, а не потому, что он верен. Поэтому выигрыш может остановиться и даже смениться проигрышем.",
                            "**Награда за результат** (outcome reward) оценивает только окончательный ответ: её выдаёт модель вознаграждения за результат (outcome reward model) или сверка с известным ответом. **Награда за шаги** (process reward) оценивает каждый шаг, и обычно её выдаёт модель вознаграждения за шаги (process reward model)."
                        ],
                        note: "В одном исследовании 2023 года на задачах по математике верификатор, обученный на пошаговой разметке от людей, надёжнее выбирал верные решения, чем обученный только на окончательных ответах."
                    }
                },
                {
                    type: "sort",
                    en: {
                        q: "Outcome reward or process reward: which does each sentence describe?",
                        groups: ["Outcome reward", "Process reward"],
                        items: [
                            ["Scores each step of a solution", 1],
                            ["Gives one score, for the final answer only", 0],
                            ["Rewards a right answer even if the reasoning behind it was wrong", 0],
                            ["Can point to the first wrong step", 1],
                            ["Needs labels for individual steps, which cost more to collect", 1],
                            ["Can be computed by one comparison with a known answer", 0]
                        ],
                        why: "An outcome reward sees only the end: it needs only final answers, often checked automatically, but it is blind to how the answer was reached. A process reward judges the path and can locate an error, at the cost of step-level labels."
                    },
                    ru: {
                        q: "Награда за результат или награда за шаги: что описывает каждое утверждение?",
                        groups: ["Награда за результат", "Награда за шаги"],
                        items: [
                            ["Оценивает каждый шаг решения", 1],
                            ["Даёт одну оценку — только за окончательный ответ", 0],
                            ["Награждает верный ответ, даже если рассуждение было ошибочным", 0],
                            ["Может указать на первый неверный шаг", 1],
                            ["Нужна разметка отдельных шагов, а её дороже собирать", 1],
                            ["Можно вычислить одним сравнением с известным ответом", 0]
                        ],
                        why: "Награда за результат видит только конец: ей нужны лишь окончательные ответы, часто проверяемые автоматически, но она не видит, как получен ответ. Награда за шаги судит весь путь и может найти ошибку, но требует разметки по шагам."
                    }
                },
                {
                    type: "info", icon: "🏋️",
                    en: {
                        title: "Training to reason with RL",
                        text: [
                            "Since 2024, several groups have reported models trained with RL on problems whose answers can be checked automatically: maths with known answers, code with tests. Such a **verifiable reward** is computed by a program, not by a learned reward model.",
                            "In these reports, the models learned to write long chains of reasoning, and their accuracy kept rising with more RL training and with more thinking tokens at answer time.",
                            "Checkable rewards are harder to game than learned ones, but not immune to reward hacking: a test suite with gaps can be passed by code that only fits the tests."
                        ]
                    },
                    ru: {
                        title: "Обучение рассуждениям с помощью RL",
                        text: [
                            "С 2024 года несколько групп сообщили о моделях, которые обучали с помощью RL на задачах с автоматически проверяемыми ответами: математика с известными ответами, код с тестами. Такую **проверяемую награду** (verifiable reward) вычисляет программа, а не обученная модель вознаграждения.",
                            "По этим сообщениям, модели научились писать длинные цепочки рассуждений, а доля верных ответов продолжала расти и с объёмом обучения RL, и с числом токенов размышления во время ответа.",
                            "Проверяемую награду обмануть труднее, чем обученную модель вознаграждения, но и она не защищена от взлома награды (reward hacking): набор тестов с пробелами пройдёт и код, который лишь подогнан под тесты."
                        ]
                    }
                },
                {
                    type: "choice", card: "r11d",
                    en: {
                        q: "A model is trained with RL on coding problems and rewarded when the tests pass. It starts writing code that recognises the test inputs and returns the expected outputs directly. What is this?",
                        options: ["Reward hacking: the reward checks the tests, not the behaviour that was intended", "Good generalisation: passing the tests was the goal of the training all along", "A bug in the RL algorithm: correct RL would never produce code like this", "Sycophancy: the model is agreeing with the views that the user has stated"],
                        hint: "Would this code work on inputs that are not in the tests?",
                        why: "RL maximises the reward as written. When the tests do not pin down the intended behaviour, fitting them directly is the easiest way to the reward, and such code fails on other inputs: the opposite of generalisation. Remedies: hidden and broader tests, checks by people, penalties for special-casing."
                    },
                    ru: {
                        q: "Модель обучают с помощью RL на задачах по программированию и награждают, когда тесты проходят. Она начинает писать код, который распознаёт входные данные тестов и сразу возвращает ожидаемые ответы. Что это?",
                        options: ["Взлом награды: награда проверяет тесты, а не то поведение, которое задумывалось", "Хорошее обобщение: пройти тесты и было целью обучения с самого начала", "Ошибка в алгоритме RL: исправный RL никогда не породил бы такой код", "Угодничество: модель соглашается со взглядами, которые высказал пользователь"],
                        hint: "Будет ли этот код работать на входах, которых нет в тестах?",
                        why: "RL максимизирует награду в том виде, в каком она записана. Если тесты не определяют задуманное поведение полностью, подогнать код под них — самый лёгкий путь к награде, а на других входах такой код ломается: это противоположность обобщения. Защита: скрытые и более полные тесты, проверки людьми, штрафы за подгонку под тесты."
                    }
                },
                {
                    type: "info", icon: "🔍",
                    en: {
                        title: "Is the written reasoning the real reasoning?",
                        text: [
                            "A chain of thought is text that the model generates, not a readout of its internal computation. How well it reflects what actually drove the answer is its **faithfulness**, and that cannot be taken for granted.",
                            "Studies have found models whose answers followed a hint placed in the prompt while their written reasoning never mentioned the hint. So the reasoning text is useful evidence about how an answer came about, not a guaranteed explanation."
                        ]
                    },
                    ru: {
                        title: "Написанное рассуждение — это настоящее рассуждение?",
                        text: [
                            "Цепочка рассуждений — это текст, который порождает модель, а не запись её внутренних вычислений. То, насколько он отражает то, что на самом деле определило ответ, называют **достоверностью рассуждений** (faithfulness), и считать её данностью нельзя.",
                            "Исследования находили модели, чьи ответы следовали подсказке, помещённой в промпт, хотя в написанных рассуждениях подсказка ни разу не упоминалась. Поэтому текст рассуждений — полезное свидетельство о том, как получен ответ, но не гарантированное объяснение."
                        ]
                    }
                },
                {
                    type: "choice",
                    en: {
                        q: "Without a hint, a model consistently answers a maths question with 12. With a hint suggesting 15 added to the prompt, it answers 15, and its written reasoning never mentions the hint. What can you conclude?",
                        options: ["Its written reasoning is not a complete account of what drove the answer", "The model did not notice the hint, since its reasoning never mentions it", "The hint had no effect on the answer: the reasoning shows the real cause", "The model deliberately lied about its reasoning to hide the hint"],
                        hint: "What does the change from 12 to 15 show about the hint? Does the reasoning say so?",
                        why: "The answer changed with the hint, so the hint mattered; the reasoning leaves it out, so it is incomplete. Calling this a deliberate lie claims an intent that this observation cannot show."
                    },
                    ru: {
                        q: "Без подсказки модель стабильно отвечает на задачу по математике: 12. Если добавить в промпт подсказку, что ответ — 15, она отвечает 15, а в её написанных рассуждениях подсказка не упоминается. Какой вывод можно сделать?",
                        options: ["Написанное рассуждение не полностью отражает то, что определило ответ", "Модель не заметила подсказку: в её рассуждениях подсказки нет", "Подсказка не повлияла на ответ: настоящую причину показывают рассуждения", "Модель намеренно солгала о своих рассуждениях, чтобы скрыть подсказку"],
                        hint: "Что смена ответа с 12 на 15 говорит о подсказке? Говорят ли об этом рассуждения?",
                        why: "Ответ изменился вместе с подсказкой, значит, она сыграла роль; рассуждения её опускают, значит, они неполны. Назвать это намеренной ложью — значит приписать умысел, который это наблюдение показать не может."
                    }
                },
                {
                    type: "recap",
                    en: {
                        points: [
                            "Each written token is fed back as input, so a chain of thought gives a fixed-depth transformer more serial computation per answer: test-time compute spent in series.",
                            "With independent errors and p > 0.5, a majority vote helps: p = 0.6 per sample gives 0.648 for a majority of 3. Correlated errors shrink the gain. With a perfect checker, best-of-n succeeds with probability `1 − (1 − p)^n`.",
                            "A learned verifier can be gamed: the more samples it ranks, the more its top pick tends to owe its rank to the verifier's errors. Outcome rewards need only final answers but are blind to the path; process rewards judge each step but need step labels.",
                            "RL with verifiable rewards can teach long reasoning, but a reward with gaps, like an incomplete test suite, can be hacked. A written chain of thought is evidence about the computation, not a guaranteed explanation."
                        ]
                    },
                    ru: {
                        points: [
                            "Каждый написанный токен снова идёт на вход, поэтому цепочка рассуждений даёт трансформеру фиксированной глубины больше последовательных вычислений на один ответ: это вычисления во время ответа, потраченные последовательно.",
                            "При независимых ошибках и p > 0,5 голосование большинством помогает: p = 0,6 на один ответ даёт 0,648 для большинства из 3. Коррелированные ошибки уменьшают выигрыш. С идеальной проверкой лучший из n успешен с вероятностью `1 − (1 − p)^n`.",
                            "Обученный верификатор можно обмануть: чем больше сэмплов он ранжирует, тем чаще его выбор оказывается первым из-за его же ошибок. Награде за результат нужны только окончательные ответы, но она не видит пути; награда за шаги судит каждый шаг, но требует пошаговой разметки.",
                            "RL с проверяемыми наградами может научить длинным рассуждениям, но награду с пробелами, например неполный набор тестов, могут взломать. Написанная цепочка рассуждений — свидетельство о вычислениях, а не гарантированное объяснение."
                        ]
                    }
                }
            ]
        },

        /* ----- r12. Research that holds up ----- */
        r12: {
            steps: [
                {
                    type: "info", icon: "🎲", mono: true,
                    en: {
                        title: "One run is one draw",
                        text: [
                            "Training runs that differ only in the random **seed** end with different scores. The seed sets a run's random choices: the initial weights, the order of the data, the dropout masks. So one run per method compares two random draws.",
                            "Train every method with several seeds, and report the mean with its spread: the standard deviation s across the runs, or the standard error of the mean, which shows how precisely the mean is known."
                        ],
                        example: ["standard error of a mean of k runs = s / √k", "s: the standard deviation of the scores across the runs"],
                        note: "Always say how many runs you made, and whether ± shows the standard deviation or the standard error."
                    },
                    ru: {
                        title: "Один запуск — один случайный исход",
                        text: [
                            "Запуски обучения, которые различаются только случайным **зерном** (seed, в речи — «сид»), дают разные результаты. Зерно задаёт случайность запуска: начальные веса, порядок данных, маски dropout. Поэтому сравнивать методы по одному запуску — значит сравнивать два случайных исхода.",
                            "Обучай каждый метод с несколькими зёрнами и сообщай среднее вместе с разбросом: стандартным отклонением s по запускам или стандартной ошибкой среднего, которая показывает, насколько точно известно среднее."
                        ],
                        example: ["стандартная ошибка среднего по k запускам = s / √k", "s — стандартное отклонение результатов по запускам"],
                        note: "Всегда указывай число запусков и то, что стоит после ±: стандартное отклонение или стандартная ошибка."
                    }
                },
                {
                    type: "number", answer: 0.3, tolerance: 0.005, card: "r12a",
                    en: {
                        q: "Four training runs that differ only in their random seed give scores with a standard deviation of 0.6 points. What is the standard error of their mean, in points?",
                        hint: "Divide the standard deviation by the square root of the number of runs.",
                        why: "For k runs with standard deviation s, the standard error of the mean is s / √k: 0.6 / √4 = 0.6 / 2 = 0.3 points. A gap of 0.4 points between two such means proves little: their difference has a standard error of √(0.3² + 0.3²) ≈ 0.42. With 16 runs each, each mean's error would fall to 0.6 / √16 = 0.15."
                    },
                    ru: {
                        q: "Четыре запуска обучения, которые различаются только случайным зерном, дали результаты со стандартным отклонением 0,6 пункта. Чему равна стандартная ошибка их среднего, в пунктах?",
                        hint: "Раздели стандартное отклонение на квадратный корень из числа запусков.",
                        why: "Для k запусков со стандартным отклонением s стандартная ошибка среднего равна s / √k: 0,6 / √4 = 0,6 / 2 = 0,3 пункта. Разрыв в 0,4 пункта между двумя такими средними мало что доказывает: у их разности стандартная ошибка √(0,3² + 0,3²) ≈ 0,42. При 16 запусках на метод ошибка каждого среднего упала бы до 0,6 / √16 = 0,15."
                    }
                },
                {
                    type: "choice",
                    en: {
                        q: "Your method beats the baseline by 0.5 points, with one run each. In this setup, the seed alone makes the score vary with a standard deviation of about 0.6 points. What should you do next?",
                        options: ["Train both methods with several seeds, and compare the means with their standard errors", "Report the gain: half a point is a clear improvement on this benchmark", "Run more seeds of your own method only, and keep the baseline's single run", "Report the best of 10 seeds of your method against the single run of the baseline"],
                        hint: "Compare the gap with the noise of one run of each method.",
                        why: "The difference of two single runs has a standard deviation of about √2 · 0.6 ≈ 0.85 points, so a gap of 0.5 is well within the noise. Only the means over several seeds of both methods can show whether the gain is real. The best of 10 seeds against one run biases the comparison in your method's favour."
                    },
                    ru: {
                        q: "Твой метод обходит базовый метод (baseline) на 0,5 пункта, по одному запуску на каждый. В этой постановке из-за одного только зерна результат колеблется со стандартным отклонением около 0,6 пункта. Что делать дальше?",
                        options: ["Обучить оба метода с несколькими зёрнами и сравнить средние с учётом их стандартных ошибок", "Сообщить о выигрыше: полпункта — явное улучшение на этом бенчмарке", "Сделать больше запусков только своего метода, а у базового оставить один", "Сравнить в статье лучший из 10 запусков своего метода с единственным запуском базового"],
                        hint: "Сравни разрыв с шумом одного запуска каждого метода.",
                        why: "У разности двух одиночных запусков стандартное отклонение около √2 · 0,6 ≈ 0,85 пункта, так что разрыв 0,5 целиком в пределах шума. Показать, реален ли выигрыш, могут только средние по нескольким зёрнам обоих методов. Лучший из 10 запусков против одного смещает сравнение в пользу твоего метода."
                    }
                },
                {
                    type: "info", icon: "🎯",
                    en: {
                        title: "A fair baseline",
                        text: [
                            "Give the baseline what the new method got: the same data, the same training budget (steps and compute) and the same tuning effort, that is, as many hyperparameter trials.",
                            "Choose checkpoints and settings for both methods on a validation set, never on the test set.",
                            "Several re-examinations have found that gains reported for new methods shrank or vanished once the baselines were tuned with the same effort."
                        ]
                    },
                    ru: {
                        title: "Честное сравнение с базовым методом",
                        text: [
                            "Дай базовому методу то же, что получил новый: те же данные, тот же бюджет обучения (шаги и вычисления) и те же усилия на настройку, то есть столько же попыток подбора гиперпараметров.",
                            "Контрольные точки (checkpoints) и настройки обоих методов выбирай по валидационной выборке, но никогда — по тестовой.",
                            "Несколько повторных проверок показали, что заявленный выигрыш новых методов уменьшался или исчезал, когда базовые методы настраивали с теми же усилиями."
                        ]
                    }
                },
                {
                    type: "sort",
                    en: {
                        q: "Fair or unfair: which of these comparisons can you trust?",
                        groups: ["Fair", "Unfair"],
                        items: [
                            ["Both methods get the same number of hyperparameter trials", 0],
                            ["The new method's learning rate was tuned; the baseline kept the value from an older paper", 1],
                            ["The new method was trained three times longer than the baseline", 1],
                            ["Both are trained on the same data with the same compute", 0],
                            ["The new method's best checkpoint was chosen by its test score", 1],
                            ["Both are scored once, at the end, on a test set that neither was tuned on", 0]
                        ],
                        why: "A comparison is fair only if everything except the idea being tested is the same for both methods, and the test set is used once, at the end. A learning rate tuned for one method only, three times as much training and a checkpoint picked on the test set all favour the new method."
                    },
                    ru: {
                        q: "Честно или нечестно: каким из этих сравнений можно доверять?",
                        groups: ["Честно", "Нечестно"],
                        items: [
                            ["Оба метода получают одинаковое число попыток подбора гиперпараметров", 0],
                            ["Новому методу подобрали скорость обучения, а базовому оставили значение из старой статьи", 1],
                            ["Новый метод обучали втрое дольше, чем базовый", 1],
                            ["Оба обучены на одних и тех же данных с одинаковым бюджетом вычислений", 0],
                            ["Лучшую контрольную точку нового метода выбрали по результату на тесте", 1],
                            ["Оба оценены один раз, в конце, на тестовой выборке, по которой не настраивали ни один", 0]
                        ],
                        why: "Сравнение честное, только если у обоих методов одинаково всё, кроме проверяемой идеи, а тестовая выборка используется один раз, в самом конце. Скорость обучения, подобранная только одному методу, втрое более долгое обучение и контрольная точка, выбранная по тесту, — всё это подыгрывает новому методу."
                    }
                },
                {
                    type: "info", icon: "🚨", mono: true,
                    en: {
                        title: "Many tests, some false alarms",
                        text: [
                            "A test at significance level α gives a false positive, or false alarm, with probability α when there is no real effect. The more tests you run, the more false alarms you should expect: the problem of **multiple comparisons**.",
                            "The **Bonferroni correction** runs each of m tests at level α / m.",
                            "Choices made after seeing the data (which metric, which subset, when to stop) act like extra tests, even if only one test is ever run: the **garden of forking paths**."
                        ],
                        example: ["m tests, no real effect: m · α false alarms expected", "independent tests: P(at least one) = 1 − (1 − α)^m", "Bonferroni, each test at α / m: P(at least one) ≤ α"],
                        note: "Only the second line needs independent tests: the first and the third hold under any dependence."
                    },
                    ru: {
                        title: "Много тестов — несколько ложных тревог",
                        text: [
                            "Тест с уровнем значимости α при отсутствии реального эффекта срабатывает с вероятностью α: это ложное срабатывание (false positive), или ложная тревога. Чем больше тестов, тем больше ложных тревог стоит ожидать: это проблема **множественных сравнений** (multiple comparisons).",
                            "**Поправка Бонферрони** (Bonferroni correction) проверяет каждый из m тестов на уровне α / m.",
                            "Решения, принятые с оглядкой на данные (какую метрику взять, какое подмножество, когда остановиться), действуют как дополнительные тесты, даже если на деле проведён всего один тест: это **сад расходящихся тропок** (garden of forking paths)."
                        ],
                        example: ["m тестов, реального эффекта нет: в среднем m · α ложных срабатываний", "независимые тесты: P(хотя бы одно) = 1 − (1 − α)^m", "Бонферрони, каждый тест на уровне α / m: P(хотя бы одно) ≤ α"],
                        note: "Независимость тестов нужна только во второй строке: первая и третья верны при любой зависимости между тестами."
                    }
                },
                {
                    type: "number", answer: 1, card: "r12b",
                    en: {
                        q: "You compare 20 variants of a method with a baseline, each in its own test at significance level 0.05. In truth, no variant is better or worse than the baseline. How many “significant” results do you expect on average?",
                        hint: "With no real effect, each test raises a false alarm with probability 0.05.",
                        why: "20 · 0.05 = 1 false positive on average. If the tests were independent, the chance of at least one would be 1 − 0.95²⁰ ≈ 0.64. The Bonferroni correction tests each at 0.05 / 20 = 0.0025, which keeps the chance of any false positive at or below 0.05."
                    },
                    ru: {
                        q: "Ты сравниваешь 20 вариантов метода с базовым методом, каждый в отдельном тесте на уровне значимости 0,05. На самом деле ни один вариант не лучше и не хуже базового метода. Сколько «значимых» результатов ожидается в среднем?",
                        hint: "Если эффекта нет, каждый тест даёт ложное срабатывание с вероятностью 0,05.",
                        why: "20 · 0,05 = 1 ложное срабатывание в среднем. Будь тесты независимыми, вероятность хотя бы одного была бы 1 − 0,95²⁰ ≈ 0,64. Поправка Бонферрони проверяет каждый тест на уровне 0,05 / 20 = 0,0025, и тогда вероятность хотя бы одного ложного срабатывания не превышает 0,05."
                    }
                },
                {
                    type: "info", icon: "✂️",
                    en: {
                        title: "Ablations: what really helps",
                        text: [
                            "A new method often changes several things at once. An **ablation** removes or replaces one component at a time (or adds one at a time to the baseline) and measures how the score changes, with several seeds per variant.",
                            "An ablation can show that a gain comes from a change nobody advertised, such as longer training or a better-tuned learning rate."
                        ],
                        note: "Changes can interact: for example, two of them may help only together. Then the drops from removing each one do not add up to the total gain."
                    },
                    ru: {
                        title: "Абляции: что на самом деле помогает",
                        text: [
                            "Новый метод часто меняет сразу несколько вещей. **Абляция** (ablation) убирает или заменяет по одному компоненту за раз (или добавляет их по одному к базовому методу) и измеряет, как меняется результат, — с несколькими зёрнами на каждый вариант.",
                            "Абляция может показать, что выигрыш дало изменение, о котором никто не заявлял: например, более долгое обучение или лучше подобранная скорость обучения."
                        ],
                        note: "Изменения могут взаимодействовать: например, два из них помогают только вместе. Тогда сумма падений результата при удалении каждого из них не совпадает с общим выигрышем."
                    }
                },
                {
                    type: "choice", card: "r12c",
                    en: {
                        q: "A new architecture makes three changes, A, B and C, to a baseline model and beats it. What shows which of the changes matter?",
                        options: ["Ablations: the full method without each change in turn, with several seeds each", "A comparison of the full method with a larger version of the baseline model", "More seeds of the full method, to measure its total gain more precisely", "The authors' own view of which change is the key idea of the method"],
                        hint: "To learn what A does, what must differ between two runs?",
                        why: "Removing one change at a time (or adding one at a time to the baseline), with the same budget and several seeds, shows the effect of each change. The other options still measure the three changes together, or measure nothing at all."
                    },
                    ru: {
                        q: "Новая архитектура вносит в базовую модель три изменения, A, B и C, и обходит её. Что покажет, какие из изменений важны?",
                        options: ["Абляции: полный метод без каждого из изменений по очереди, с несколькими зёрнами на вариант", "Сравнение полного метода с увеличенной версией базовой модели", "Больше запусков полного метода с разными зёрнами, чтобы точнее измерить его общий выигрыш", "Мнение авторов о том, какое из изменений — главная идея метода"],
                        hint: "Чтобы узнать, что даёт A, чем должны различаться два запуска?",
                        why: "Удаление изменений по одному (или добавление по одному к базовой модели) при том же бюджете и с несколькими зёрнами показывает, что даёт каждое. Остальные варианты по-прежнему измеряют три изменения вместе или вообще ничего не измеряют."
                    }
                },
                {
                    type: "info", icon: "🔭",
                    en: {
                        title: "Does it hold at scale?",
                        text: [
                            "The gain from a trick that helps a small model may shrink or vanish in a larger one. One possible reason: the larger model learns the same thing by itself.",
                            "One systematic study of many proposed modifications to the transformer found that most of them did not give meaningful gains across the settings it tested.",
                            "Before claiming a general improvement, test the change at several scales and on more than one task."
                        ]
                    },
                    ru: {
                        title: "Сохранится ли выигрыш при масштабировании?",
                        text: [
                            "Выигрыш от приёма, который помогает маленькой модели, может уменьшиться или исчезнуть у большой. Одна из возможных причин: большая модель сама выучивает то же самое.",
                            "Одно систематическое исследование многих предложенных изменений трансформера показало, что большинство из них не дали существенного выигрыша в тех постановках, которые в нём проверялись.",
                            "Прежде чем заявлять об улучшении в целом, проверь изменение на нескольких масштабах и на нескольких задачах."
                        ]
                    }
                },
                {
                    type: "choice", card: "r12d",
                    en: {
                        q: "A trick improves a model with 10 million parameters by 2 points. What should you check before claiming that it helps large models?",
                        options: ["Whether the gain holds at several larger scales, where it may shrink or vanish", "Nothing more: a gain found at a small scale usually grows at larger scales", "Only that the same training code also runs on much bigger hardware", "Only that the trick has a clear theoretical reason to help at any scale"],
                        hint: "Could a larger model learn by itself what the trick provides?",
                        why: "Scale can change what a model learns by itself, so a gain at 10 million parameters is weak evidence about large models. A claim about large models needs evidence at the scales it is about."
                    },
                    ru: {
                        q: "Приём улучшает модель с 10 миллионами параметров на 2 пункта. Что нужно проверить, прежде чем утверждать, что он помогает большим моделям?",
                        options: ["Сохраняется ли выигрыш на нескольких более крупных масштабах: там он может уменьшиться или исчезнуть", "Больше ничего: выигрыш, найденный на малом масштабе, обычно растёт с размером модели", "Только то, что тот же код обучения запускается и на более мощном оборудовании", "Только то, что у приёма есть ясное теоретическое обоснование для любого масштаба"],
                        hint: "Может ли большая модель сама выучить то, что даёт приём?",
                        why: "Масштаб может менять то, что модель выучивает сама, поэтому выигрыш у модели с 10 миллионами параметров — слабое свидетельство о больших моделях. Утверждению о больших моделях нужны данные именно на тех масштабах, о которых оно говорит."
                    }
                },
                {
                    type: "recap",
                    en: {
                        points: [
                            "One run is one draw: report the mean over several seeds with its standard error `s / √k`, and say what the ± shows.",
                            "Give the baseline the same data, compute and tuning effort as the new method, and use the test set once, at the end.",
                            "With no real effect, m tests at level α give `m · α` false alarms on average: correct for them (Bonferroni: each at `α / m`), and count choices made after seeing the data as tests too.",
                            "Ablate one change at a time, with several seeds, and test at several scales before claiming a general gain."
                        ]
                    },
                    ru: {
                        points: [
                            "Один запуск — один случайный исход: сообщай среднее по нескольким зёрнам со стандартной ошибкой `s / √k` и указывай, что стоит после ±.",
                            "Давай базовому методу те же данные, вычисления и усилия на настройку, что и новому, а тестовую выборку используй один раз, в самом конце.",
                            "Если реальных эффектов нет, m тестов на уровне α дают в среднем `m · α` ложных срабатываний: делай поправку (Бонферрони: каждый на уровне `α / m`) и считай тестами и решения, принятые с оглядкой на данные.",
                            "Проводи абляции по одному изменению за раз, с несколькими зёрнами, а прежде чем заявлять об общем выигрыше, проверяй его на нескольких масштабах."
                        ]
                    }
                }
            ]
        }
    }
});
