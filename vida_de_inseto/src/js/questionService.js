export const questionBank = [
  {
    id: "q-bubble-pass",
    category: "IALG",
    topic: "IALG - Ordenacao",
    difficulty: "Facil",
    prompt: "No Bubble Sort, o que garante que ao final de cada passagem o maior elemento esteja na posicao correta?",
    options: [
      "Comparacoes adjacentes com troca quando arr[j] > arr[j+1]",
      "Busca binaria na metade direita",
      "Particionamento por pivo central",
      "Empilhamento recursivo de subvetores",
    ],
    correctOption: 0,
    code: `#include <vector>\nusing namespace std;\n\nvoid bubbleSort(vector<int>& arr) {\n    for (int i = 0; i < (int)arr.size() - 1; ++i) {\n        for (int j = 0; j < (int)arr.size() - 1 - i; ++j) {\n            if (arr[j] > arr[j + 1]) {\n                int tmp = arr[j];\n                arr[j] = arr[j + 1];\n                arr[j + 1] = tmp;\n            }\n        }\n    }\n}`,
  },
  {
    id: "q-tree-inorder",
    category: "ED",
    topic: "ED - Arvores",
    difficulty: "Medio",
    prompt: "Em percurso em-ordem de arvore binaria, qual e a ordem correta das visitas?",
    options: ["Raiz, Esquerda, Direita", "Esquerda, Raiz, Direita", "Direita, Esquerda, Raiz", "Esquerda, Direita, Raiz"],
    correctOption: 1,
    code: `#include <iostream>\nusing namespace std;\n\nstruct Node {\n    int val;\n    Node* left;\n    Node* right;\n};\n\nvoid inOrder(Node* root) {\n    if (!root) return;\n    inOrder(root->left);\n    cout << root->val << " ";\n    inOrder(root->right);\n}`,
  },
  {
    id: "q-dfs-stack",
    category: "Grafos",
    topic: "Grafos - DFS",
    difficulty: "Medio",
    prompt: "No DFS iterativo, qual estrutura substitui a pilha de chamadas da recursao?",
    options: ["Fila", "Heap", "Pilha", "Tabela hash"],
    correctOption: 2,
    code: `#include <vector>\n#include <stack>\nusing namespace std;\n\nvoid dfsIterative(int start, const vector<vector<int>>& g) {\n    vector<int> vis(g.size(), 0);\n    stack<int> st;\n    st.push(start);\n\n    while (!st.empty()) {\n        int u = st.top();\n        st.pop();\n        if (vis[u]) continue;\n        vis[u] = 1;\n\n        for (int v : g[u]) {\n            if (!vis[v]) st.push(v);\n        }\n    }\n}`,
  },
  {
    id: "q-bfs-queue",
    category: "Grafos",
    topic: "Grafos - BFS",
    difficulty: "Facil",
    prompt: "No BFS, por que o uso de fila e essencial?",
    options: [
      "Para explorar por profundidade",
      "Para manter ordem FIFO por camadas",
      "Para ordenar os vertices automaticamente",
      "Para reduzir complexidade para O(log n)",
    ],
    correctOption: 1,
    code: `#include <vector>\n#include <queue>\nusing namespace std;\n\nvoid bfs(int start, const vector<vector<int>>& g) {\n    vector<int> vis(g.size(), 0);\n    queue<int> q;\n    q.push(start);\n    vis[start] = 1;\n\n    while (!q.empty()) {\n        int u = q.front();\n        q.pop();\n        for (int v : g[u]) {\n            if (!vis[v]) {\n                vis[v] = 1;\n                q.push(v);\n            }\n        }\n    }\n}`,
  },
  {
    id: "q-list-middle",
    category: "ED",
    topic: "ED - Lista Encadeada",
    difficulty: "Medio",
    prompt: "Para inserir no meio usando tecnica de dois ponteiros, qual avanca mais rapido?",
    options: ["slow", "fast", "prev", "head"],
    correctOption: 1,
    code: `#include <cstddef>\nusing namespace std;\n\nstruct Node {\n    int value;\n    Node* next;\n};\n\nNode* insertMiddle(Node* head, int x) {\n    if (!head) return new Node{x, nullptr};\n\n    Node* slow = head;\n    Node* fast = head;\n    Node* prev = nullptr;\n\n    while (fast && fast->next) {\n        prev = slow;\n        slow = slow->next;\n        fast = fast->next->next;\n    }\n\n    Node* node = new Node{x, slow};\n    if (prev) prev->next = node;\n    return head;\n}`,
  },
  {
    id: "q-selection-min",
    category: "IALG",
    topic: "IALG - Selection Sort",
    difficulty: "Facil",
    prompt: "No Selection Sort, o que representa minIdx durante o laço interno?",
    options: [
      "Indice do maior elemento encontrado",
      "Indice do menor elemento encontrado",
      "Quantidade de trocas realizadas",
      "Posicao fixa do pivo",
    ],
    correctOption: 1,
    code: `#include <vector>\nusing namespace std;\n\nvoid selectionSort(vector<int>& arr) {\n    for (int i = 0; i < (int)arr.size() - 1; ++i) {\n        int minIdx = i;\n        for (int j = i + 1; j < (int)arr.size(); ++j) {\n            if (arr[j] < arr[minIdx]) minIdx = j;\n        }\n        if (minIdx != i) swap(arr[i], arr[minIdx]);\n    }\n}`,
  },
  {
    id: "q-insertion-shift",
    category: "IALG",
    topic: "IALG - Insertion Sort",
    difficulty: "Facil",
    prompt: "No Insertion Sort, quando ocorre deslocamento de elementos?",
    options: [
      "Quando key e menor que arr[j]",
      "Quando key e maior que arr[j]",
      "Somente no primeiro passo",
      "Nunca, so faz swap direto",
    ],
    correctOption: 0,
    code: `#include <vector>\nusing namespace std;\n\nvoid insertionSort(vector<int>& arr) {\n    for (int i = 1; i < (int)arr.size(); ++i) {\n        int key = arr[i];\n        int j = i - 1;\n        while (j >= 0 && arr[j] > key) {\n            arr[j + 1] = arr[j];\n            --j;\n        }\n        arr[j + 1] = key;\n    }\n}`,
  },
  {
    id: "q-merge-halves",
    category: "IALG",
    topic: "IALG - Merge Sort",
    difficulty: "Medio",
    prompt: "Qual etapa garante a ordenacao final no Merge Sort?",
    options: [
      "Escolha aleatoria de pivo",
      "Intercalacao ordenada das metades",
      "Troca de pares adjacentes",
      "Busca em profundidade",
    ],
    correctOption: 1,
    code: `#include <vector>\nusing namespace std;\n\nvoid merge(vector<int>& a, int l, int m, int r) {\n    vector<int> tmp;\n    int i = l, j = m + 1;\n    while (i <= m && j <= r) tmp.push_back(a[i] <= a[j] ? a[i++] : a[j++]);\n    while (i <= m) tmp.push_back(a[i++]);\n    while (j <= r) tmp.push_back(a[j++]);\n    for (int k = l; k <= r; ++k) a[k] = tmp[k - l];\n}`,
  },
  {
    id: "q-quick-partition",
    category: "IALG",
    topic: "IALG - Quick Sort",
    difficulty: "Medio",
    prompt: "A particao no Quick Sort tem qual objetivo principal?",
    options: [
      "Separar elementos menores e maiores que o pivo",
      "Garantir estabilidade do algoritmo",
      "Eliminar recursao",
      "Ordenar tudo em uma unica passada",
    ],
    correctOption: 0,
    code: `#include <vector>\nusing namespace std;\n\nint partition(vector<int>& a, int l, int r) {\n    int pivot = a[r];\n    int i = l - 1;\n    for (int j = l; j < r; ++j) {\n        if (a[j] <= pivot) { ++i; swap(a[i], a[j]); }\n    }\n    swap(a[i + 1], a[r]);\n    return i + 1;\n}`,
  },
  {
    id: "q-binary-mid",
    category: "IALG",
    topic: "IALG - Busca Binaria",
    difficulty: "Facil",
    prompt: "Como evitar overflow ao calcular o meio na busca binaria?",
    options: [
      "mid = (l + r) / 2",
      "mid = l + (r - l) / 2",
      "mid = r - l",
      "mid = l * r / 2",
    ],
    correctOption: 1,
    code: `int binarySearch(const vector<int>& a, int x) {\n    int l = 0, r = (int)a.size() - 1;\n    while (l <= r) {\n        int m = l + (r - l) / 2;\n        if (a[m] == x) return m;\n        if (a[m] < x) l = m + 1;\n        else r = m - 1;\n    }\n    return -1;\n}`,
  },
  {
    id: "q-stack-lifo",
    category: "ED",
    topic: "ED - Pilha",
    difficulty: "Facil",
    prompt: "Qual principio define o comportamento de uma pilha?",
    options: ["FIFO", "LIFO", "Heap order", "Round robin"],
    correctOption: 1,
    code: `#include <stack>\nusing namespace std;\n\nint main() {\n    stack<int> st;\n    st.push(10);\n    st.push(20);\n    st.pop();\n}`,
  },
  {
    id: "q-queue-fifo",
    category: "ED",
    topic: "ED - Fila",
    difficulty: "Facil",
    prompt: "Em uma fila, qual elemento sai primeiro?",
    options: [
      "Ultimo inserido",
      "Maior valor",
      "Primeiro inserido",
      "Elemento do meio",
    ],
    correctOption: 2,
    code: `#include <queue>\nusing namespace std;\n\nint main() {\n    queue<int> q;\n    q.push(7);\n    q.push(9);\n    q.pop();\n}`,
  },
  {
    id: "q-tree-height",
    category: "ED",
    topic: "ED - Arvores",
    difficulty: "Medio",
    prompt: "A altura de uma arvore binaria e geralmente definida como:",
    options: [
      "Numero de folhas",
      "Maior numero de arestas ate uma folha",
      "Quantidade de nos internos",
      "Profundidade do menor no",
    ],
    correctOption: 1,
    code: `int height(Node* root) {\n    if (!root) return -1;\n    return 1 + max(height(root->left), height(root->right));\n}`,
  },
  {
    id: "q-avl-balance",
    category: "ED",
    topic: "ED - AVL",
    difficulty: "Medio",
    prompt: "Em AVL, o fator de balanceamento permitido por no e:",
    options: ["-3 a 3", "-2 a 2", "-1 a 1", "0 apenas"],
    correctOption: 2,
    code: `int balanceFactor(Node* n) {\n    return height(n->left) - height(n->right);\n}`,
  },
  {
    id: "q-hash-collision",
    category: "ED",
    topic: "ED - Hash",
    difficulty: "Medio",
    prompt: "Colisao em tabela hash ocorre quando:",
    options: [
      "Dois elementos geram o mesmo indice",
      "A chave e negativa",
      "A tabela esta ordenada",
      "A busca e binaria",
    ],
    correctOption: 0,
    code: `size_t h(const string& s, size_t m) {\n    size_t acc = 0;\n    for (char c : s) acc = acc * 31 + (unsigned char)c;\n    return acc % m;\n}`,
  },
  {
    id: "q-heap-root",
    category: "ED",
    topic: "ED - Heap",
    difficulty: "Facil",
    prompt: "No max-heap, qual elemento fica na raiz?",
    options: ["Menor elemento", "Elemento mediano", "Maior elemento", "Ultimo inserido"],
    correctOption: 2,
    code: `#include <queue>\nusing namespace std;\n\npriority_queue<int> pq;\npq.push(4);\npq.push(10);\nint top = pq.top();`,
  },
  {
    id: "q-poo-encapsulation",
    category: "POO",
    topic: "POO - Encapsulamento",
    difficulty: "Facil",
    prompt: "Encapsulamento em POO significa principalmente:",
    options: [
      "Expor todos os atributos publicamente",
      "Esconder detalhes internos e expor interface controlada",
      "Evitar classes",
      "Usar apenas heranca multipla",
    ],
    correctOption: 1,
    code: `#include <string>\nusing namespace std;\n\nclass Conta {\nprivate:\n    double saldo;\npublic:\n    void depositar(double v) { saldo += v; }\n    double getSaldo() const { return saldo; }\n};`,
  },
  {
    id: "q-poo-inheritance",
    category: "POO",
    topic: "POO - Heranca",
    difficulty: "Facil",
    prompt: "Em heranca, a classe derivada:",
    options: [
      "Nao pode reutilizar nada da base",
      "Reutiliza e pode especializar comportamento da base",
      "Sempre remove metodos da base",
      "So funciona em structs",
    ],
    correctOption: 1,
    code: `class Animal {\npublic:\n    virtual string som() const { return \"...\"; }\n};\n\nclass Gato : public Animal {\npublic:\n    string som() const override { return \"miau\"; }\n};`,
  },
  {
    id: "q-poo-polymorphism",
    category: "POO",
    topic: "POO - Polimorfismo",
    difficulty: "Medio",
    prompt: "Para polimorfismo dinamico em C++, normalmente usamos:",
    options: ["Templates", "Metodos static", "Metodos virtuais", "Macros"],
    correctOption: 2,
    code: `class Shape {\npublic:\n    virtual double area() const = 0;\n    virtual ~Shape() = default;\n};`,
  },
  {
    id: "q-poo-abstraction",
    category: "POO",
    topic: "POO - Abstracao",
    difficulty: "Medio",
    prompt: "Abstracao ajuda a:",
    options: [
      "Focar no essencial e esconder complexidade desnecessaria",
      "Eliminar qualquer uso de classe",
      "Substituir algoritmos por constantes",
      "Evitar reutilizacao de codigo",
    ],
    correctOption: 0,
    code: `class Repositorio {\npublic:\n    virtual void salvar(const string& item) = 0;\n    virtual ~Repositorio() = default;\n};`,
  },
  {
    id: "q-poo-constructor",
    category: "POO",
    topic: "POO - Construtores",
    difficulty: "Facil",
    prompt: "Qual papel principal de um construtor?",
    options: [
      "Destruir objeto no fim da vida",
      "Inicializar estado do objeto na criacao",
      "Criar heranca automaticamente",
      "Substituir metodos virtuais",
    ],
    correctOption: 1,
    code: `class Usuario {\nprivate:\n    string nome;\npublic:\n    explicit Usuario(string n) : nome(move(n)) {}\n};`,
  },
  {
    id: "q-dfs-recursion",
    category: "Grafos",
    topic: "Grafos - DFS",
    difficulty: "Facil",
    prompt: "Na DFS recursiva, o que evita visitar um vertice repetidamente?",
    options: ["Ordenacao", "Vetor de visitados", "Fila circular", "Pivo"],
    correctOption: 1,
    code: `void dfs(int u, const vector<vector<int>>& g, vector<int>& vis) {\n    vis[u] = 1;\n    for (int v : g[u]) if (!vis[v]) dfs(v, g, vis);\n}`,
  },
  {
    id: "q-bfs-layer",
    category: "Grafos",
    topic: "Grafos - BFS",
    difficulty: "Medio",
    prompt: "BFS e ideal para descobrir:",
    options: [
      "Caminhos minimos em grafo nao ponderado",
      "Arvore geradora minima ponderada",
      "Ordenacao topologica com ciclos",
      "Componentes fortemente conectados apenas",
    ],
    correctOption: 0,
    code: `vector<int> dist(n, -1);\nqueue<int> q;\ndist[s] = 0;\nq.push(s);\nwhile (!q.empty()) {\n    int u = q.front(); q.pop();\n    for (int v : g[u]) if (dist[v] == -1) {\n        dist[v] = dist[u] + 1;\n        q.push(v);\n    }\n}`,
  },
  {
    id: "q-topo-indegree",
    category: "Grafos",
    topic: "Grafos - Topologica",
    difficulty: "Medio",
    prompt: "No algoritmo de Kahn, quais vertices entram primeiro na fila?",
    options: [
      "Vertices com maior grau de saida",
      "Vertices com grau de entrada zero",
      "Vertices de maior peso",
      "Vertices sem aresta de saida",
    ],
    correctOption: 1,
    code: `queue<int> q;\nfor (int i = 0; i < n; ++i) if (indeg[i] == 0) q.push(i);\nwhile (!q.empty()) {\n    int u = q.front(); q.pop();\n    for (int v : g[u]) if (--indeg[v] == 0) q.push(v);\n}`,
  },
  {
    id: "q-dijkstra-nonnegative",
    category: "Grafos",
    topic: "Grafos - Dijkstra",
    difficulty: "Medio",
    prompt: "Qual restricao classica para Dijkstra funcionar corretamente?",
    options: [
      "Grafo deve ser completo",
      "Nao pode haver pesos negativos",
      "Deve ser arvore",
      "Apenas matriz de adjacencia",
    ],
    correctOption: 1,
    code: `priority_queue<pair<int,int>, vector<pair<int,int>>, greater<pair<int,int>>> pq;\nvector<int> dist(n, INF);\ndist[s] = 0;\npq.push({0, s});`,
  },
  {
    id: "q-kruskal-dsu",
    category: "Grafos",
    topic: "Grafos - Kruskal",
    difficulty: "Dificil",
    prompt: "Qual estrutura e tipicamente usada para detectar ciclos no Kruskal?",
    options: ["Pilha", "Fila", "Union-Find (DSU)", "Tabela hash"],
    correctOption: 2,
    code: `struct DSU {\n    vector<int> p, r;\n    int find(int x){ return p[x] == x ? x : p[x] = find(p[x]); }\n    bool unite(int a, int b){\n        a = find(a); b = find(b);\n        if (a == b) return false;\n        if (r[a] < r[b]) swap(a, b);\n        p[b] = a;\n        if (r[a] == r[b]) r[a]++;\n        return true;\n    }\n};`,
  },
  {
    id: "q-prim-cut",
    category: "Grafos",
    topic: "Grafos - Prim",
    difficulty: "Dificil",
    prompt: "No Prim, a aresta escolhida em cada passo deve:",
    options: [
      "Ter o menor peso cruzando o corte atual",
      "Ligar dois vertices ja na arvore",
      "Sempre sair do vertice de menor indice",
      "Pertencer ao caminho mais longo",
    ],
    correctOption: 0,
    code: `for (int i = 0; i < n; ++i) {\n    int u = -1;\n    for (int v = 0; v < n; ++v)\n        if (!used[v] && (u == -1 || minEdge[v] < minEdge[u])) u = v;\n    used[u] = true;\n    for (auto [to, w] : g[u]) if (!used[to] && w < minEdge[to]) minEdge[to] = w;\n}`,
  },
  {
    id: "q-floyd-update",
    category: "Grafos",
    topic: "Grafos - Floyd-Warshall",
    difficulty: "Dificil",
    prompt: "Qual transicao define o Floyd-Warshall?",
    options: [
      "dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j])",
      "dist[i][j] = dist[i][j] + 1",
      "dist[i][j] = max(dist[i][k], dist[k][j])",
      "dist[i][j] = min(dist[i][k], dist[k][j])",
    ],
    correctOption: 0,
    code: `for (int k = 0; k < n; ++k)\n  for (int i = 0; i < n; ++i)\n    for (int j = 0; j < n; ++j)\n      dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j]);`,
  },
  {
    id: "q-cpa-bigoh",
    category: "CPA",
    topic: "CPA - Complexidade",
    difficulty: "Facil",
    prompt: "Qual notacao descreve limite assintotico superior de tempo?",
    options: ["Omega", "Theta", "Big-O", "Sigma"],
    correctOption: 2,
    code: `#include <iostream>\nusing namespace std;\n\nint complexityExample(int n) {\n    return 3 * n * n + 2 * n + 1;\n}`,
  },
  {
    id: "q-cpa-theta",
    category: "CPA",
    topic: "CPA - Analise",
    difficulty: "Medio",
    prompt: "A notacao Theta representa:",
    options: [
      "Limite inferior apenas",
      "Limite superior apenas",
      "Limite superior e inferior apertado",
      "Complexidade media apenas",
    ],
    correctOption: 2,
    code: `#include <iostream>\nusing namespace std;\n\nvoid explainTheta() {\n    // c1*g(n) <= f(n) <= c2*g(n)\n}`,
  },
  {
    id: "q-cpa-master",
    category: "CPA",
    topic: "CPA - Recorrencias",
    difficulty: "Medio",
    prompt: "No metodo mestre, T(n)=2T(n/2)+n resulta em:",
    options: ["O(log n)", "O(n)", "O(n log n)", "O(n^2)"],
    correctOption: 2,
    code: `#include <iostream>\nusing namespace std;\n\nint masterCase(int n) {\n    // T(n) = 2T(n/2) + n -> Theta(n log n)\n    return n;\n}`,
  },
  {
    id: "q-cpa-greedy",
    category: "CPA",
    topic: "CPA - Paradigmas",
    difficulty: "Facil",
    prompt: "Algoritmos gulosos tomam decisoes:",
    options: [
      "Globais com backtracking",
      "Locais otimas em cada passo",
      "Aleatorias para evitar minimo local",
      "Somente com programacao dinamica",
    ],
    correctOption: 1,
    code: `#include <vector>\nusing namespace std;\n\nint greedyPick(const vector<int>& values) {\n    return values.empty() ? 0 : values[0];\n}`,
  },
  {
    id: "q-cpa-dp",
    category: "CPA",
    topic: "CPA - Programacao Dinamica",
    difficulty: "Dificil",
    prompt: "Qual propriedade justifica uso de programacao dinamica?",
    options: [
      "Subproblemas sobrepostos e subestrutura otima",
      "Ausencia total de repeticao de estados",
      "Apenas estruturas em arvore",
      "Necessidade de ordenacao topologica",
    ],
    correctOption: 0,
    code: `int fib(int n) {\n    vector<int> dp(n + 1, 0);\n    dp[1] = 1;\n    for (int i = 2; i <= n; ++i) dp[i] = dp[i - 1] + dp[i - 2];\n    return dp[n];\n}`,
  },
  {
    id: "q-ialg-stability",
    category: "IALG",
    topic: "IALG - Ordenacao",
    difficulty: "Medio",
    prompt: "Um algoritmo de ordenacao estavel preserva:",
    options: [
      "A ordem relativa de elementos com mesma chave",
      "A maior chave na primeira posicao",
      "A recursao em cauda",
      "A ordem inversa da entrada",
    ],
    correctOption: 0,
    code: `#include <vector>\nusing namespace std;\n\nvoid stableExample(vector<pair<int,int>>& a) {\n    // criterio principal: first\n    // estabilidade preserva ordem de second para empates\n}`,
  },
  {
    id: "q-ialg-linear-search",
    category: "IALG",
    topic: "IALG - Busca Linear",
    difficulty: "Facil",
    prompt: "A busca linear tem custo no pior caso de:",
    options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
    correctOption: 2,
    code: `int linearSearch(const vector<int>& a, int x) {\n    for (int i = 0; i < (int)a.size(); ++i)\n        if (a[i] == x) return i;\n    return -1;\n}`,
  },
  {
    id: "q-ed-deque",
    category: "ED",
    topic: "ED - Deque",
    difficulty: "Facil",
    prompt: "Deque permite insercao e remocao em:",
    options: [
      "Apenas no inicio",
      "Apenas no fim",
      "Inicio e fim",
      "Apenas no meio",
    ],
    correctOption: 2,
    code: `#include <deque>\nusing namespace std;\n\ndeque<int> dq;\ndq.push_front(1);\ndq.push_back(2);\ndq.pop_front();`,
  },
  {
    id: "q-ed-tree-bst",
    category: "ED",
    topic: "ED - BST",
    difficulty: "Medio",
    prompt: "Em uma BST, todos os valores da subarvore esquerda sao:",
    options: [
      "Maiores que a raiz",
      "Menores que a raiz",
      "Iguais a raiz",
      "Aleatorios",
    ],
    correctOption: 1,
    code: `struct Node {\n    int key;\n    Node* left;\n    Node* right;\n};`,
  },
  {
    id: "q-poo-interface",
    category: "POO",
    topic: "POO - Interfaces",
    difficulty: "Medio",
    prompt: "Em C++, uma interface pode ser modelada por:",
    options: [
      "Classe com metodos estaticos",
      "Classe abstrata com metodos virtuais puros",
      "Struct sem metodos",
      "Namespace com funcoes globais",
    ],
    correctOption: 1,
    code: `class ILog {\npublic:\n    virtual void info(const string& msg) = 0;\n    virtual ~ILog() = default;\n};`,
  },
  {
    id: "q-poo-overload",
    category: "POO",
    topic: "POO - Sobrecarga",
    difficulty: "Facil",
    prompt: "Sobrecarga de metodo ocorre quando:",
    options: [
      "Mesmo nome, assinaturas diferentes",
      "Mesmo nome e mesma assinatura",
      "Somente em classes filhas",
      "Apenas com templates",
    ],
    correctOption: 0,
    code: `class Calc {\npublic:\n    int soma(int a, int b) { return a + b; }\n    double soma(double a, double b) { return a + b; }\n};`,
  },
  {
    id: "q-grafos-componentes",
    category: "Grafos",
    topic: "Grafos - Componentes",
    difficulty: "Medio",
    prompt: "Para contar componentes conexas em grafo nao direcionado, usa-se tipicamente:",
    options: ["BFS/DFS a partir de vertices nao visitados", "Dijkstra", "Floyd", "Kruskal"],
    correctOption: 0,
    code: `int comps = 0;\nfor (int u = 0; u < n; ++u) {\n    if (!vis[u]) {\n        ++comps;\n        dfs(u, g, vis);\n    }\n}`,
  },
  {
    id: "q-grafos-ciclo-dir",
    category: "Grafos",
    topic: "Grafos - Ciclos",
    difficulty: "Dificil",
    prompt: "Em grafo dirigido, uma forma comum de detectar ciclo em DFS usa:",
    options: [
      "Distancias minimas",
      "Cores/estado de visita (branco-cinza-preto)",
      "Union-Find",
      "Apenas grau de entrada",
    ],
    correctOption: 1,
    code: `bool hasCycle(int u) {\n    color[u] = 1;\n    for (int v : g[u]) {\n        if (color[v] == 1) return true;\n        if (color[v] == 0 && hasCycle(v)) return true;\n    }\n    color[u] = 2;\n    return false;\n}`,
  },
  {
    id: "q-cpa-divconq",
    category: "CPA",
    topic: "CPA - Paradigmas",
    difficulty: "Facil",
    prompt: "Divisao e conquista segue, em geral, qual padrao?",
    options: [
      "Dividir, resolver subproblemas, combinar",
      "Ordenar, inverter, descartar",
      "Buscar, remover, reinserir",
      "Empilhar, desempilhar, reiniciar",
    ],
    correctOption: 0,
    code: `int solve(int n) {\n    if (n <= 1) return 1;\n    int a = solve(n / 2);\n    int b = solve(n / 2);\n    return a + b + n;\n}`,
  },
  {
    id: "q-cpa-amortized",
    category: "CPA",
    topic: "CPA - Analise",
    difficulty: "Medio",
    prompt: "Analise amortizada avalia:",
    options: [
      "Custo medio por operacao em sequencia",
      "Somente pior caso absoluto",
      "Apenas melhor caso",
      "Tempo de compilacao",
    ],
    correctOption: 0,
    code: `#include <vector>\nusing namespace std;\n\nint amortizedPushCost(int n) {\n    vector<int> v;\n    for (int i = 0; i < n; ++i) v.push_back(i);\n    return 1; // custo amortizado por insercao\n}`,
  },
];

/**
 * @returns {{score:number, answered:number, correct:number, currentQuestion:Object|null}}
 */
export function createInitialState() {
  return {
    score: 0,
    answered: 0,
    correct: 0,
    currentQuestion: null,
  };
}

/**
 * @param {Array<Object>} bank
 * @param {Function} rng
 * @param {string} category
 * @returns {Object}
 */
export function pickRandomQuestion(bank = questionBank, rng = Math.random, category = "all") {
  if (!Array.isArray(bank) || bank.length === 0) {
    throw new Error("Banco de perguntas vazio");
  }

  const filtered = category === "all"
    ? bank
    : bank.filter((item) => item.category === category);

  if (filtered.length === 0) {
    throw new Error(`Sem perguntas para categoria: ${category}`);
  }

  const index = Math.floor(rng() * filtered.length);
  return filtered[index];
}

/**
 * @param {Object} question
 * @param {number} selectedIndex
 * @returns {boolean}
 */
export function isAnswerCorrect(question, selectedIndex) {
  if (!question) {
    return false;
  }
  return Number(selectedIndex) === Number(question.correctOption);
}

/**
 * @param {Object} state
 * @param {Object} question
 * @param {number} selectedIndex
 * @returns {Object}
 */
export function applyAnswer(state, question, selectedIndex) {
  const correct = isAnswerCorrect(question, selectedIndex);
  return {
    ...state,
    answered: state.answered + 1,
    correct: state.correct + (correct ? 1 : 0),
    score: state.score + (correct ? 10 : 0),
    currentQuestion: question,
  };
}
