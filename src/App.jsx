import React, { useState, useEffect } from 'react';
import { 
  Utensils, 
  ShoppingBag, 
  ChefHat, 
  Bike, 
  Plus, 
  Minus, 
  Trash2, 
  CheckCircle, 
  Clock, 
  MapPin, 
  Phone, 
  User, 
  AlertTriangle, 
  Printer, 
  QrCode, 
  ChevronRight,
  Search,
  Check,
  X,
  Lock,
  LogOut,
  KeyRound
} from 'lucide-react';

// --- CONFIGURAÇÃO E INICIALIZAÇÃO DO FIREBASE ---
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot, 
  updateDoc, 
  doc, 
  deleteDoc, 
  getDocs,
  query,
  orderBy
} from 'firebase/firestore';

// NOVAS CREDENCIAIS DO PROJETO TOCA-B1107
const firebaseConfig = {
  apiKey: "AIzaSyDXRvsTqRgnyvxpHAvpqWy3dl0wd5TyJLk",
  authDomain: "toca-b1107.firebaseapp.com",
  projectId: "toca-b1107",
  storageBucket: "toca-b1107.firebasestorage.app",
  messagingSenderId: "917547065874",
  appId: "1:917547065874:web:6c2720edaa16ecee23aecb"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- BANCO DE DADOS SIMULADO DO CARDÁPIO ---
const MENU_CATEGORIES = ['Todos', 'Hambúrgueres', 'Pratos Principais', 'Bebidas', 'Sobremesas'];

const MENU_ITEMS = [
  {
    id: 'h1',
    name: 'Gourmet House Burger',
    category: 'Hambúrgueres',
    price: 34.90,
    description: 'Pão brioche, blend 180g, queijo cheddar, bacon crocante, cebola caramelizada e maionese da casa.',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80',
    removableIngredients: ['Cebola Caramelizada', 'Bacon', 'Maionese da Casa', 'Cheddar']
  },
  {
    id: 'h2',
    name: 'Smash Salad Special',
    category: 'Hambúrgueres',
    price: 28.50,
    description: 'Pão com gergelim, 2x smash 90g, queijo prato, alface americana, tomate, cebola roxa e maionese especial.',
    image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=500&q=80',
    removableIngredients: ['Alface', 'Tomate', 'Cebola Roxa', 'Maionese Especial']
  },
  {
    id: 'p1',
    name: 'Filé Mignon à Parmegiana',
    category: 'Pratos Principais',
    price: 49.90,
    description: 'Acompanha arroz branco e batata frita temperada com alho e salsinha.',
    image: 'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?auto=format&fit=crop&w=500&q=80',
    removableIngredients: ['Alho na Batata', 'Salsinha', 'Molho de Tomate']
  },
  {
    id: 'p2',
    name: 'Moqueca Baiana de Camarão',
    category: 'Pratos Principais',
    price: 68.00,
    description: 'Camarões frescos, leite de coco, azeite de dendê, pimentões, cebola e bastante coentro.',
    image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=500&q=80',
    removableIngredients: ['Coentro', 'Cebola', 'Pimentão', 'Azeite de Dendê']
  },
  {
    id: 'b1',
    name: 'Suco Natural de Laranja (500ml)',
    category: 'Bebidas',
    price: 9.50,
    description: 'Suco 100% natural espremido na hora.',
    image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=500&q=80',
    removableIngredients: ['Gelo', 'Açúcar']
  },
  {
    id: 'b2',
    name: 'Refrigerante Lata 350ml',
    category: 'Bebidas',
    price: 6.50,
    description: 'Coca-Cola, Guaraná Antarctica ou Sprite.',
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=500&q=80',
    removableIngredients: ['Gelo', 'Rodela de Limão']
  },
  {
    id: 's1',
    name: 'Petit Gâteau de Chocolate',
    category: 'Sobremesas',
    price: 22.00,
    description: 'Bolinho quente de chocolate com recheio cremoso, acompanhado de sorvete de baunilha e calda de morango.',
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=500&q=80',
    removableIngredients: ['Calda de Morango', 'Sorvete de Baunilha', 'Castanhas']
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('client');
  const [orders, setOrders] = useState([]);

  // ESCUTA EM TEMPO REAL DO FIREBASE FIRESTORE
  useEffect(() => {
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, orderBy('createdAtTimestamp', 'desc'));
    
    // O onSnapshot atualiza o estado instantaneamente em todos os dispositivos conectados
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedOrders = snapshot.docs.map(docSnap => ({
        firestoreId: docSnap.id,
        ...docSnap.data()
      }));
      setOrders(fetchedOrders);
    }, (error) => {
      console.error("Erro ao sincronizar pedidos com Firebase:", error);
    });

    return () => unsubscribe();
  }, []);

  // ESTADO DE AUTENTICAÇÃO DO STAFF (Senha: 4040)
  const [isAuthenticatedStaff, setIsAuthenticatedStaff] = useState(false);
  const [isStaffLoginOpen, setIsStaffLoginOpen] = useState(false);
  const [staffPin, setStaffPin] = useState('');
  const [pinError, setPinError] = useState('');

  // ESTADOS DO CLIENTE E CARRINHO
  const [orderType, setOrderType] = useState('LOCAL');
  const [selectedTable, setSelectedTable] = useState('Mesa 05');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');

  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // ITEM SENDO CUSTOMIZADO NO MODAL
  const [customizingItem, setCustomizingItem] = useState(null);
  const [tempRemovedIngredients, setTempRemovedIngredients] = useState([]);
  const [tempNotes, setTempNotes] = useState('');

  // ESTADO DO CHECKOUT
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [street, setStreet] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [checkoutError, setCheckoutError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cartão de Crédito');
  const [changeFor, setChangeFor] = useState('');

  // ESTADO DO MODAL CUSTOMIZADO DE CONFIRMAÇÃO DE RESET
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // ENDEREÇO FIXO DA SEDE DO RESTAURANTE (ORIGEM)
  const RESTAURANT_ORIGIN = 'Rua do Orvalho, 310, João Pessoa, PB';
  const GOOGLE_MAPS_API_KEY = 'AIzaSyDrhTuu5nAFQfxAtfnWlfbVKveLTu2EDtk';

  const fullAddress = `${street}${houseNumber ? `, Nº ${houseNumber}` : ''}${complement ? ` (${complement})` : ''}${street ? ', João Pessoa, PB' : ''}`;
  const [realDeliveryInfo, setRealDeliveryInfo] = useState({ distanceKm: 0, fee: 4.00, loading: false });

  // FUNÇÃO DE CÁLCULO VIA GOOGLE ROUTES API / DISTANCE MATRIX API
  const fetchGoogleDistance = async (destinationAddress) => {
    if (!destinationAddress || !street.trim() || !houseNumber.trim()) return;

    setRealDeliveryInfo(prev => ({ ...prev, loading: true }));

    if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === 'SUA_CHAVE_AQUI') {
      const length = destinationAddress.trim().length;
      const distanceKm = parseFloat((0.3 + (length % 10) * 0.1).toFixed(1));
      const fee = parseFloat((4.00 + distanceKm * 1.50).toFixed(2));
      setRealDeliveryInfo({ distanceKm, fee, loading: false });
      return;
    }

    try {
      const routesUrl = `https://routes.googleapis.com/v1/computeRoutes`;
      
      const response = await fetch(routesUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
          'X-Goog-FieldMask': 'routes.distanceMeters,routes.duration'
        },
        body: JSON.stringify({
          origin: { address: RESTAURANT_ORIGIN },
          destination: { address: destinationAddress },
          travelMode: 'DRIVE'
        })
      });

      const data = await response.json();

      if (data.routes && data.routes[0]?.distanceMeters !== undefined) {
        const distanceInMeters = data.routes[0].distanceMeters;
        const distanceKm = parseFloat((distanceInMeters / 1000).toFixed(1));
        const fee = parseFloat((4.00 + distanceKm * 1.50).toFixed(2));
        setRealDeliveryInfo({ distanceKm, fee, loading: false });
        return;
      }

      const originParam = encodeURIComponent(RESTAURANT_ORIGIN);
      const destParam = encodeURIComponent(destinationAddress);
      const fallbackUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${originParam}&destinations=${destParam}&key=${GOOGLE_MAPS_API_KEY}`;
      
      const fallbackResponse = await fetch(fallbackUrl);
      const fallbackData = await fallbackResponse.json();

      if (fallbackData.status === 'OK' && fallbackData.rows[0]?.elements[0]?.status === 'OK') {
        const distanceKm = parseFloat((fallbackData.rows[0].elements[0].distance.value / 1000).toFixed(1));
        const fee = parseFloat((4.00 + distanceKm * 1.50).toFixed(2));
        setRealDeliveryInfo({ distanceKm, fee, loading: false });
      } else {
        setRealDeliveryInfo(prev => ({ ...prev, loading: false }));
      }
    } catch (error) {
      console.error('Erro ao consultar Google Routes API:', error);
      setRealDeliveryInfo(prev => ({ ...prev, loading: false }));
    }
  };

  React.useEffect(() => {
    if (orderType === 'DELIVERY' && street.trim() && houseNumber.trim()) {
      const timer = setTimeout(() => {
        fetchGoogleDistance(fullAddress);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [street, houseNumber, complement, orderType]);

  const deliveryFee = orderType === 'DELIVERY' ? realDeliveryInfo.fee : 0;
  const [printModalData, setPrintModalData] = useState(null);

  const handleNameChange = (e) => {
    const val = e.target.value;
    if (/^[a-zA-ZáàâãéèêíïóôõöúçñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ\s]*$/.test(val)) {
      setCustomerName(val);
      setCheckoutError('');
    }
  };

  const handlePhoneChange = (e) => {
    const val = e.target.value;
    if (/^\d*$/.test(val) && val.length <= 11) {
      setCustomerPhone(val);
      setCheckoutError('');
    }
  };

  // LIMPAR TODOS OS PEDIDOS NO FIREBASE
  const handleClearAllOrders = () => {
    setIsResetConfirmOpen(true);
  };

  const confirmClearAllOrders = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'orders'));
      const deletePromises = snapshot.docs.map(docSnap => deleteDoc(doc(db, 'orders', docSnap.id)));
      await Promise.all(deletePromises);
      setIsResetConfirmOpen(false);
    } catch (err) {
      console.error("Erro ao limpar pedidos no Firebase:", err);
    }
  };

  // AUTENTICAÇÃO STAFF
  const handleStaffLogin = (e) => {
    e.preventDefault();
    if (staffPin === '4040') {
      setIsAuthenticatedStaff(true);
      setIsStaffLoginOpen(false);
      setStaffPin('');
      setPinError('');
      setActiveTab('kitchen');
    } else {
      setPinError('PIN incorreto. Tente novamente.');
    }
  };

  const handleStaffLogout = () => {
    setIsAuthenticatedStaff(false);
    setActiveTab('client');
  };

  const handleOpenCustomizeModal = (item) => {
    setCustomizingItem(item);
    setTempRemovedIngredients([]);
    setTempNotes('');
  };

  const toggleIngredientRemoval = (ingredient) => {
    if (tempRemovedIngredients.includes(ingredient)) {
      setTempRemovedIngredients(tempRemovedIngredients.filter(i => i !== ingredient));
    } else {
      setTempRemovedIngredients([...tempRemovedIngredients, ingredient]);
    }
  };

  const handleAddToCart = () => {
    if (!customizingItem) return;

    const cartItem = {
      cartId: `${customizingItem.id}-${Date.now()}`,
      id: customizingItem.id,
      name: customizingItem.name,
      price: customizingItem.price,
      removedIngredients: [...tempRemovedIngredients],
      notes: tempNotes,
      quantity: 1
    };

    setCart([...cart, cartItem]);
    setCustomizingItem(null);
  };

  const handleRemoveFromCart = (cartId) => {
    setCart(cart.filter(item => item.cartId !== cartId));
  };

  const handleUpdateQuantity = (cartId, delta) => {
    setCart(cart.map(item => {
      if (item.cartId === cartId) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };

  const cartSubtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartTotal = cartSubtotal + deliveryFee;

  // ENVIAR PEDIDO PARA O FIREBASE FIRESTORE
  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    if (!customerName.trim()) {
      setCheckoutError('Por favor, informe seu nome.');
      return;
    }

    if (orderType === 'DELIVERY') {
      if (customerPhone.length !== 11) {
        setCheckoutError('O telefone deve conter exatamente 11 dígitos (incluindo DDD). Ex: 11999998888');
        return;
      }
      if (!street.trim() || !houseNumber.trim()) {
        setCheckoutError('Por favor, preencha o nome da rua e o número.');
        return;
      }
    }

    const orderId = `PED-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder = {
      id: orderId,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAtTimestamp: Date.now(),
      type: orderType,
      table: orderType === 'LOCAL' ? selectedTable : '',
      customerName: customerName.trim(),
      phone: customerPhone,
      address: orderType === 'DELIVERY' ? fullAddress : '',
      distanceKm: orderType === 'DELIVERY' ? realDeliveryInfo.distanceKm : 0,
      deliveryFee: orderType === 'DELIVERY' ? deliveryFee : 0,
      paymentMethod,
      changeFor: paymentMethod === 'Dinheiro' ? changeFor : '',
      status: 'PENDENTE',
      items: [...cart],
      total: cartTotal
    };

    try {
      // Salva na nuvem no Firebase
      await addDoc(collection(db, 'orders'), newOrder);

      setCart([]);
      setCustomerName('');
      setCustomerPhone('');
      setStreet('');
      setHouseNumber('');
      setComplement('');
      setCheckoutError('');
      setIsCheckoutOpen(false);
      setIsCartOpen(false);

      alert(`Pedido #${orderId} enviado com sucesso! Acompanhe o preparo com nossa equipe.`);
    } catch (err) {
      console.error("Erro ao enviar pedido ao Firebase:", err);
      alert("Houve um erro ao enviar seu pedido. Verifique se criou a coleção de dados no Firebase no modo de teste.");
    }
  };

  // ATUALIZAR STATUS DO PEDIDO NO FIREBASE
  const handleUpdateOrderStatus = async (order, newStatus) => {
    if (!order.firestoreId) return;
    try {
      const orderRef = doc(db, 'orders', order.firestoreId);
      await updateDoc(orderRef, { status: newStatus });
    } catch (err) {
      console.error("Erro ao atualizar status no Firebase:", err);
    }
  };

  const filteredMenuItems = MENU_ITEMS.filter(item => {
    const matchesCategory = selectedCategory === 'Todos' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 antialiased pb-12">
      {/* NAVEGAÇÃO E CABEÇALHO */}
      <header className="bg-slate-900 text-white sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-orange-600 p-2 rounded-xl text-white">
              <Utensils size={24} />
            </div>
            <div>
              <h1 className="font-extrabold text-lg tracking-tight text-white leading-none">Sabor & Arte</h1>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">Gastronomia & Experiência Digital</p>
            </div>
          </div>

          {isAuthenticatedStaff ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('client')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'client' ? 'bg-orange-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <QrCode size={16} /> Cardápio
              </button>
              <button
                onClick={() => setActiveTab('kitchen')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'kitchen' ? 'bg-orange-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <ChefHat size={16} /> Cozinha ({orders.length})
              </button>
              <button
                onClick={() => setActiveTab('driver')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'driver' ? 'bg-orange-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Bike size={16} /> Entregador ({orders.filter(o => o.type === 'DELIVERY').length})
              </button>
              <button
                onClick={handleStaffLogout}
                className="p-1.5 bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white rounded-xl transition-all ml-1"
                title="Sair do Modo Equipe"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative bg-orange-600 hover:bg-orange-700 text-white p-2.5 rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2 text-xs font-bold"
            >
              <ShoppingBag size={18} />
              <span>Carrinho</span>
              {cart.length > 0 && (
                <span className="bg-white text-orange-600 px-1.5 py-0.5 rounded-full text-[10px] font-black">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>
          )}
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="max-w-7xl mx-auto px-4 pt-6">

        {/* VISÃO 1: CARDÁPIO DIGITAL */}
        {activeTab === 'client' && (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Modo de Pedido:</span>
                <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                  <button
                    onClick={() => setOrderType('LOCAL')}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      orderType === 'LOCAL' ? 'bg-orange-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Consumir no Local
                  </button>
                  <button
                    onClick={() => setOrderType('DELIVERY')}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      orderType === 'DELIVERY' ? 'bg-orange-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Entrega (Delivery)
                  </button>
                </div>
              </div>

              {orderType === 'LOCAL' ? (
                <div className="flex items-center gap-2 text-xs font-semibold bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-xl border border-emerald-200">
                  <QrCode size={16} />
                  <span>Mesa Atual: <strong>{selectedTable}</strong></span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs font-semibold bg-purple-50 text-purple-800 px-3 py-1.5 rounded-xl border border-purple-200">
                  <Bike size={16} />
                  <span>Taxa de Entrega: <strong>R$ {deliveryFee.toFixed(2)}</strong></span>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center bg-white px-3 py-2 rounded-2xl border border-slate-200 shadow-sm">
                <Search size={18} className="text-slate-400 mr-2" />
                <input
                  type="text"
                  placeholder="Buscar pratos, bebidas ou sobremesas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {MENU_CATEGORIES.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      selectedCategory === category 
                        ? 'bg-slate-900 text-white shadow-md' 
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMenuItems.map(item => (
                <div key={item.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                  <div>
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-44 object-cover"
                    />
                    <div className="p-4 space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-bold text-slate-900 text-base">{item.name}</h3>
                        <span className="font-extrabold text-orange-600 text-base whitespace-nowrap">
                          R$ {item.price.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2">{item.description}</p>
                    </div>
                  </div>

                  <div className="p-4 pt-0">
                    <button
                      onClick={() => handleOpenCustomizeModal(item)}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      <Plus size={16} /> Montar e Adicionar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VISÃO 2: PAINEL DA COZINHA (KDS) */}
        {activeTab === 'kitchen' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <ChefHat className="text-orange-600" size={24} />
                  Painel de Monitoramento da Cozinha (KDS)
                </h2>
                <p className="text-xs text-slate-500">Sincronizado via Firebase Firestore em Tempo Real</p>
              </div>
              <div className="flex items-center gap-2">
                {orders.length > 0 && (
                  <button
                    onClick={handleClearAllOrders}
                    className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                  >
                    <Trash2 size={14} />
                    Limpar Todos os Pedidos
                  </button>
                )}
                <div className="flex items-center gap-2 text-xs font-semibold bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-lg border border-emerald-200">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Firebase Online
                </div>
              </div>
            </div>

            {orders.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
                <Utensils size={48} className="mx-auto mb-3 opacity-30" />
                <p className="font-semibold">Nenhum pedido recebido no momento.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {orders.map(order => (
                  <div 
                    key={order.firestoreId || order.id} 
                    className={`bg-white rounded-2xl border-2 overflow-hidden shadow-sm flex flex-col justify-between transition-all ${
                      order.status === 'PENDENTE' ? 'border-amber-400' :
                      order.status === 'EM_PREPARO' ? 'border-blue-500' : 'border-slate-200 opacity-75'
                    }`}
                  >
                    <div>
                      <div className={`p-4 border-b flex items-center justify-between ${
                        order.status === 'PENDENTE' ? 'bg-amber-50 border-amber-200' :
                        order.status === 'EM_PREPARO' ? 'bg-blue-50 border-blue-200' : 'bg-slate-100 border-slate-200'
                      }`}>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-slate-900 text-lg">{order.id}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                              order.type === 'LOCAL' ? 'bg-emerald-100 text-emerald-800' : 'bg-purple-100 text-purple-800'
                            }`}>
                              {order.type === 'LOCAL' ? order.table : 'DELIVERY'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <Clock size={12} /> Recebido às {order.createdAt}
                          </p>
                        </div>

                        <button
                          onClick={() => setPrintModalData({ order, type: 'KITCHEN' })}
                          className="p-2 bg-white rounded-xl border border-slate-200 text-slate-600 hover:text-orange-600 hover:border-orange-300 transition-all shadow-sm"
                        >
                          <Printer size={18} />
                        </button>
                      </div>

                      <div className="p-4 space-y-4">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                            <div className="flex items-start justify-between gap-2">
                              <span className="font-bold text-slate-900 text-base">
                                <span className="bg-slate-900 text-white text-xs px-1.5 py-0.5 rounded mr-1.5">
                                  {item.quantity}x
                                </span>
                                {item.name}
                              </span>
                            </div>

                            {item.removedIngredients && item.removedIngredients.length > 0 && (
                              <div className="mt-2 bg-red-50 border border-red-200 rounded-lg p-2 flex items-start gap-1.5">
                                <AlertTriangle size={14} className="text-red-600 shrink-0 mt-0.5" />
                                <div>
                                  <span className="text-[10px] font-black text-red-700 uppercase tracking-wide">REMOVER INGREDIENTES:</span>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {item.removedIngredients.map(ing => (
                                      <span key={ing} className="bg-red-600 text-white font-bold text-xs px-2 py-0.5 rounded">
                                        SEM {ing.toUpperCase()}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}

                            {item.notes && (
                              <p className="text-xs font-semibold text-amber-800 bg-amber-50 p-1.5 rounded mt-1.5 border border-amber-200">
                                Obs: {item.notes}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-2">
                      <p className="text-xs text-slate-500 font-medium">Status do Preparo:</p>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleUpdateOrderStatus(order, 'EM_PREPARO')}
                          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                            order.status === 'EM_PREPARO' 
                              ? 'bg-blue-600 text-white shadow-md' 
                              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          Em Preparo
                        </button>
                        <button
                          onClick={() => handleUpdateOrderStatus(order, 'PRONTO')}
                          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                            order.status === 'PRONTO' 
                              ? 'bg-emerald-600 text-white shadow-md' 
                              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          Pronto
                        </button>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VISÃO 3: PAINEL DO ENTREGADOR */}
        {activeTab === 'driver' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Bike className="text-orange-600" size={24} />
                  Painel de Expedição e Entregadores
                </h2>
                <p className="text-xs text-slate-500">Sincronizado via Firebase Firestore em Tempo Real</p>
              </div>
              {orders.length > 0 && (
                <button
                  onClick={handleClearAllOrders}
                  className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                >
                  <Trash2 size={14} />
                  Limpar Todos os Pedidos
                </button>
              )}
            </div>

            {orders.filter(o => o.type === 'DELIVERY').length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
                <Bike size={48} className="mx-auto mb-3 opacity-30" />
                <p className="font-semibold">Nenhum pedido para entrega no momento.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {orders.filter(o => o.type === 'DELIVERY').map(order => (
                  <div key={order.firestoreId || order.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
                    <div>
                      <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-lg">{order.id}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                              order.status === 'PRONTO' ? 'bg-amber-400 text-slate-900' :
                              order.status === 'EM_ROTA' ? 'bg-blue-400 text-slate-900' : 'bg-emerald-400 text-slate-900'
                            }`}>
                              {order.status === 'PRONTO' ? 'Aguardando Coleta' :
                               order.status === 'EM_ROTA' ? 'Em Rota' : 'Entregue'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1">Horário: {order.createdAt}</p>
                        </div>

                        <button
                          onClick={() => setPrintModalData({ order, type: 'DRIVER' })}
                          className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 transition-all flex items-center gap-1.5 text-xs font-bold"
                        >
                          <Printer size={16} />
                          Nota do Entregador
                        </button>
                      </div>

                      <div className="p-4 space-y-3">
                        <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                          <User size={18} className="text-slate-500 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-semibold text-slate-500">Cliente</p>
                            <p className="font-bold text-slate-900 text-sm">{order.customerName}</p>
                            {order.phone && (
                              <p className="text-xs text-slate-600 flex items-center gap-1 mt-1">
                                <Phone size={12} /> {order.phone}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                          <MapPin size={18} className="text-orange-600 shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-slate-500">Endereço de Entrega</p>
                            <p className="font-bold text-slate-900 text-sm leading-snug">{order.address}</p>
                            
                            {order.distanceKm > 0 && (
                              <div className="mt-2 flex items-center justify-between bg-orange-50 border border-orange-200 p-2 rounded-lg text-xs">
                                <span className="font-semibold text-orange-900">
                                  Distância estimada: <strong>~{order.distanceKm} km</strong>
                                </span>
                                <a
                                  href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(RESTAURANT_ORIGIN)}&destination=${encodeURIComponent(order.address)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-orange-600 hover:text-orange-800 font-bold underline flex items-center gap-1"
                                >
                                  Ver no Maps
                                </a>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-500 font-medium">Forma de Pagamento:</span>
                            <span className="font-bold text-slate-800">{order.paymentMethod}</span>
                          </div>
                          {order.changeFor && (
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-500 font-medium">Troco para:</span>
                              <span className="font-bold text-amber-600">R$ {order.changeFor}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-500 font-medium">Taxa de Entrega:</span>
                            <span className="font-bold text-emerald-600">R$ {order.deliveryFee.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm pt-2 border-t border-slate-200 font-extrabold text-slate-900">
                            <span>Total do Pedido:</span>
                            <span className="text-orange-600">R$ {order.total.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 border-t border-slate-200 flex gap-2">
                      <button
                        onClick={() => handleUpdateOrderStatus(order, 'EM_ROTA')}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                          order.status === 'EM_ROTA' 
                            ? 'bg-blue-600 text-white shadow-md' 
                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        Em Rota
                      </button>
                      <button
                        onClick={() => handleUpdateOrderStatus(order, 'ENTREGUE')}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                          order.status === 'ENTREGUE' 
                            ? 'bg-emerald-600 text-white shadow-md' 
                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        Entregue
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>

      {/* RODAPÉ E ÁREA RESTRITA */}
      <footer className="bg-slate-900 text-slate-400 py-6 border-t border-slate-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© 2026 Sabor & Arte Digital - Todos os direitos reservados.</p>
          
          {!isAuthenticatedStaff && (
            <button
              onClick={() => setIsStaffLoginOpen(true)}
              className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 transition-colors py-1 px-3 rounded-lg hover:bg-slate-800"
            >
              <Lock size={12} />
              <span>Área da Equipe / Staff</span>
            </button>
          )}
        </div>
      </footer>

      {/* MODAIS DA APLICAÇÃO */}
      {isStaffLoginOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xs w-full p-6 shadow-2xl space-y-4 border border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                <KeyRound size={20} className="text-orange-600" />
                Acesso Restrito
              </div>
              <button 
                onClick={() => { setIsStaffLoginOpen(false); setPinError(''); setStaffPin(''); }}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleStaffLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">PIN de Acesso</label>
                <input
                  type="password"
                  maxLength={6}
                  placeholder="Digite o PIN"
                  value={staffPin}
                  onChange={(e) => setStaffPin(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center text-lg font-bold tracking-widest focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  autoFocus
                />
                {pinError && <p className="text-red-500 text-[11px] font-semibold mt-1 text-center">{pinError}</p>}
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95"
              >
                Entrar no Painel
              </button>
            </form>
          </div>
        </div>
      )}

      {customizingItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base">{customizingItem.name}</h3>
              <button 
                onClick={() => setCustomizingItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Remover Ingredientes?</h4>
                <p className="text-[11px] text-slate-500">Marque os itens que deseja RETIRAR do seu prato:</p>
              </div>

              <div className="space-y-2">
                {customizingItem.removableIngredients.map(ingredient => {
                  const isRemoved = tempRemovedIngredients.includes(ingredient);
                  return (
                    <button
                      key={ingredient}
                      type="button"
                      onClick={() => toggleIngredientRemoval(ingredient)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs font-semibold transition-all ${
                        isRemoved 
                          ? 'bg-red-50 border-red-300 text-red-700 shadow-sm' 
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {isRemoved ? <X size={16} className="text-red-600" /> : <Check size={16} className="text-slate-400" />}
                        {ingredient}
                      </span>
                      {isRemoved && (
                        <span className="bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                          REMOVER
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Observações Adicionais</label>
              <textarea
                rows={2}
                placeholder="Ex: Ponto da carne bem passado, pouco sal..."
                value={tempNotes}
                onChange={(e) => setTempNotes(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] text-slate-400 font-medium">Preço Unitário</p>
                <p className="font-extrabold text-slate-900 text-lg">R$ {customizingItem.price.toFixed(2)}</p>
              </div>
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Plus size={16} /> Adicionar ao Pedido
              </button>
            </div>
          </div>
        </div>
      )}

      {isCartOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 border border-slate-100 max-h-[90vh] flex flex-col justify-between">
            <div className="space-y-4 overflow-y-auto pr-1">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="text-orange-600" size={20} />
                  <h3 className="font-extrabold text-slate-900 text-base">Seu Carrinho</h3>
                </div>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X size={20} />
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="py-8 text-center text-slate-400">
                  <ShoppingBag size={40} className="mx-auto mb-2 opacity-30" />
                  <p className="font-semibold text-xs">Seu carrinho está vazio.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map(item => (
                    <div key={item.cartId} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
                      <div className="space-y-1 flex-1">
                        <h4 className="font-bold text-slate-900 text-sm">{item.name}</h4>
                        
                        {item.removedIngredients && item.removedIngredients.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {item.removedIngredients.map(ing => (
                              <span key={ing} className="bg-red-100 text-red-700 text-[10px] font-bold px-1.5 py-0.5 rounded">
                                SEM {ing.toUpperCase()}
                              </span>
                            ))}
                          </div>
                        )}

                        {item.notes && (
                          <p className="text-[11px] text-amber-700 italic">Obs: {item.notes}</p>
                        )}

                        <p className="font-extrabold text-slate-800 text-xs">
                          R$ {(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-xl border border-slate-200">
                        <button 
                          onClick={() => handleUpdateQuantity(item.cartId, -1)}
                          className="text-slate-500 hover:text-orange-600 p-1"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="font-bold text-xs min-w-4 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => handleUpdateQuantity(item.cartId, 1)}
                          className="text-slate-500 hover:text-orange-600 p-1"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <button 
                        onClick={() => handleRemoveFromCart(item.cartId)}
                        className="text-slate-400 hover:text-red-500 p-1.5 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal</span>
                    <span>R$ {cartSubtotal.toFixed(2)}</span>
                  </div>
                  {orderType === 'DELIVERY' && (
                    <div className="flex justify-between text-slate-500">
                      <span>Taxa de Entrega</span>
                      <span className="text-emerald-600 font-semibold">R$ {deliveryFee.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-black text-slate-900 text-base pt-1">
                    <span>Total</span>
                    <span className="text-orange-600">R$ {cartTotal.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setIsCheckoutOpen(true);
                  }}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  Avançar para o Fechamento <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {isCheckoutOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base">Finalizar Pedido</h3>
              <button 
                onClick={() => setIsCheckoutOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitOrder} className="space-y-4">
              {checkoutError && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle size={16} className="shrink-0 text-red-500" />
                  <span>{checkoutError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Seu Nome * (Apenas letras)</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Maria Silva"
                  value={customerName}
                  onChange={handleNameChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {orderType === 'DELIVERY' ? (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Telefone / WhatsApp * (Exatamente 11 números)</label>
                    <input
                      type="tel"
                      required
                      placeholder="Ex: 11988887777"
                      value={customerPhone}
                      onChange={handlePhoneChange}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500 font-mono"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Dígitos informados: {customerPhone.length}/11</p>
                  </div>

                  <div className="space-y-2 pt-1 border-t border-slate-100">
                    <label className="block text-xs font-bold text-slate-700">Endereço de Entrega *</label>
                    
                    <div>
                      <input
                        type="text"
                        required
                        placeholder="Nome da Rua / Av."
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-1">
                        <input
                          type="text"
                          required
                          placeholder="Número"
                          value={houseNumber}
                          onChange={(e) => setHouseNumber(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="text"
                          placeholder="Complemento / Bairro"
                          value={complement}
                          onChange={(e) => setComplement(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                    </div>

                    {fullAddress.trim() && (
                      <div className="mt-2 bg-emerald-50 border border-emerald-200 p-2 rounded-xl text-xs flex justify-between items-center text-emerald-800">
                        {realDeliveryInfo.loading ? (
                          <span className="text-slate-500 font-semibold animate-pulse">Calculando rota exata no Google Maps...</span>
                        ) : (
                          <>
                            <span>Distância real: <strong>~{realDeliveryInfo.distanceKm} km</strong></span>
                            <span className="font-bold">Taxa: R$ {realDeliveryInfo.fee.toFixed(2)}</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="bg-orange-50 p-3 rounded-xl border border-orange-200 text-xs text-orange-800 font-semibold flex items-center gap-2">
                  <Utensils size={18} />
                  Pedido para consumo na <strong>{selectedTable}</strong> (Apenas o nome é necessário)
                </div>
              )}

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700">Forma de Pagamento</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Cartão de Crédito', 'Pix', 'Dinheiro'].map(method => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                        paymentMethod === method
                          ? 'border-orange-600 bg-orange-50 text-orange-700'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              {paymentMethod === 'Dinheiro' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Troco para Quanto?</label>
                  <input
                    type="text"
                    placeholder="Ex: 50.00 ou Não preciso"
                    value={changeFor}
                    onChange={(e) => setChangeFor(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              )}

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 pt-3">
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Itens ({cart.length})</span>
                  <span>R$ {cartSubtotal.toFixed(2)}</span>
                </div>
                {orderType === 'DELIVERY' && (
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Taxa de Entrega</span>
                    <span className="text-emerald-700 font-semibold">R$ {deliveryFee.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-black text-slate-900 text-base pt-2 border-t border-slate-200">
                  <span>Total Geral</span>
                  <span className="text-orange-600">R$ {cartTotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3.5 rounded-xl font-bold text-xs shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Check size={18} />
                Confirmar e Enviar Pedido
              </button>

            </form>
          </div>
        </div>
      )}

      {printModalData && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl font-mono text-xs text-slate-900 space-y-4 border border-slate-300">
            <div className="text-center border-b border-dashed border-slate-400 pb-3">
              <h3 className="font-bold text-base uppercase">Sabor & Arte Restaurant</h3>
              <p className="text-[10px] text-slate-500">{RESTAURANT_ORIGIN}</p>
              <div className="mt-2 font-bold bg-slate-100 py-1 rounded border border-slate-300 text-sm">
                VIA DE: {printModalData.type === 'KITCHEN' ? 'COZINHA (PREPARO)' : 'ENTREGADOR (ENTREGA)'}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <span>PEDIDO: <strong>{printModalData.order.id}</strong></span>
                <span>HORA: {printModalData.order.createdAt}</span>
              </div>
              <div className="flex justify-between">
                <span>TIPO: <strong>{printModalData.order.type}</strong></span>
                <span>DESTINO: <strong>{printModalData.order.type === 'LOCAL' ? printModalData.order.table : 'DELIVERY'}</strong></span>
              </div>
              {printModalData.order.customerName && (
                <div>CLIENTE: <strong>{printModalData.order.customerName}</strong></div>
              )}
              {printModalData.type === 'DRIVER' && printModalData.order.address && (
                <div className="bg-slate-100 p-2 rounded border border-slate-300 mt-1 font-sans">
                  <p className="font-bold text-slate-800">ENDEREÇO DE ENTREGA:</p>
                  <p className="text-slate-700">{printModalData.order.address}</p>
                  {printModalData.order.phone && <p className="text-slate-600">TEL: {printModalData.order.phone}</p>}
                </div>
              )}
            </div>

            <div className="border-t border-b border-dashed border-slate-400 py-3 space-y-3">
              {printModalData.order.items.map((item, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between font-bold text-sm">
                    <span>{item.quantity}x {item.name}</span>
                    <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
                  </div>

                  {item.removedIngredients && item.removedIngredients.length > 0 && (
                    <div className="pl-3 font-sans text-red-600 font-bold bg-red-50 p-1 rounded border border-red-200">
                      *** SEM {item.removedIngredients.join(', ').toUpperCase()} ***
                    </div>
                  )}
                  {item.notes && (
                    <div className="pl-3 italic text-amber-800">
                      Obs: {item.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-1 text-right">
              {printModalData.order.type === 'DELIVERY' && (
                <div>TAXA ENTREGA: R$ {printModalData.order.deliveryFee.toFixed(2)}</div>
              )}
              <div className="font-bold text-sm text-slate-900">
                TOTAL: R$ {printModalData.order.total.toFixed(2)}
              </div>
              <div className="text-slate-600">
                PAGAMENTO: {printModalData.order.paymentMethod}
              </div>
              {printModalData.order.changeFor && (
                <div className="font-bold text-amber-700">
                  TROCO PARA: R$ {printModalData.order.changeFor}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-200 flex gap-2 font-sans">
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex-1 bg-slate-900 text-white py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <Printer size={14} /> Imprimir Comanda
              </button>
              <button
                onClick={() => setPrintModalData(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl font-bold text-xs"
              >
                Fechar
              </button>
            </div>

          </div>
        </div>
      )}

      {isResetConfirmOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-slate-100 text-center">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
              <AlertTriangle size={24} />
            </div>

            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Limpar todos os pedidos no Firebase?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Esta ação apagará permanentemente todos os pedidos da base de dados na nuvem para todos os dispositivos.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setIsResetConfirmOpen(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl font-bold text-xs transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={confirmClearAllOrders}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95"
              >
                Sim, Limpar Tudo
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}