import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { addDoc, collection, doc, getDoc, getDocs, orderBy, query, updateDoc, where } from 'firebase/firestore';

import { Container, Stack } from '@mui/material';
import Card from '@mui/material/Card';
// import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import classes from './Products.module.css';

import { db, storage } from '../services/firebase';
import ProductModal from '../Reuseable/Modal/ProductModal';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import MenuIcon from 'src/Reuseable/MenuIcon/MenuIcon';
import { deleteObject, getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';

export default function Products() {
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState(null);
  const [product, setProduct] = useState({
    name: '',
    description: '',
    coverImg: '',
    isAvailable: false,
    districts: [],
    district: '',
    price: {},
    quantity: 0,
    unit: '',
    minStock: -1, // -1 -> unlimited | 0 -> limited and there is no stock to proceed
    categoryId: '',
    img: '',
    imgUrlLocal: '',
    // images: [],
  });
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    if (params.id) {
      // console.log('id:', params.id);
      getProducts(params.id);
      if (location.state) {
        setCategory(location.state);
        setProduct((prevState) => ({
          ...prevState,
          categoryId: location.state.id,
        }));
      } else {
        getCategoryByid(params.id);
      }
    } else {
      navigate('/dashboard/categories');
    }
  }, [params.id, location.state]);

  useEffect(() => {
    // console.time('useEffect');
    const getDistricts = async () => {
      const districtRef = collection(db, 'availableDistricts');
      const q = query(districtRef, where('isAvailable', '==', true));
      const querySnapshot = await getDocs(q);
      const arr = [];
      querySnapshot.forEach((doc) => {
        // console.log(doc.id, ' => ', doc.data());
        arr.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      const updatedArr = arr.map((district) => ({
        displayName: district.id,
        value: district.id,
      }));
      setProduct((prevState) => ({
        ...prevState,
        districts: updatedArr,
      }));
    };

    getDistricts();
    // console.timeEnd('useEffect');
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setIsEdit(false);
    setProduct((prevState) => ({
      ...prevState,
      name: '',
      description: '',
      coverImg: '',
      isAvailable: false,
      // districts: [],
      district: '',
      price: {},
      quantity: 0,
      unit: '',
      minStock: -1, // -1 -> unlimited | 0 -> limited and there is no stock to proceed
      // categoryId: '',
      img: '',
      imgUrlLocal: '',
    }));
  };

  const getProducts = (categoryId) => {
    const productsRef = collection(db, 'products');
    const q = query(productsRef, where('categoryId', '==', categoryId), orderBy('name'));
    getDocs(q)
      .then((querySnapshot) => {
        const docs = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        console.log('getProducts:', docs);
        setProducts(docs);
      })
      .catch((error) => {
        console.log('Error getting products:', error);
      });
  };

  const getCategoryByid = async (id) => {
    const docRef = doc(db, 'categories', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      // console.log('Document data:', docSnap.data());
      setCategory(docSnap.data());
      setProduct((prevState) => ({
        ...prevState,
        categoryId: docSnap.data().id,
      }));
    } else {
      // docSnap.data() will be undefined in this case
      console.log('No such document!');
    }
  };

  const handleEditItem = (item) => {
    // console.log('prod: ', item);
    setIsEdit(true);
    handleOpen();
    setProduct({
      ...item,
      districts: product.districts,
      district: '',
      img: '',
      imgUrlLocal: item?.coverImg,
    });
  };

  const saveHandler = () => {
    // console.log('product:', product, Object.keys(product.price));
    const districts = Object.keys(product.price);
    let count = 0;
    const priceAll = {};
    districts.forEach((district) => {
      const price = product.price[district];
      if (price.costPrice === 0 && price.offerPrice === 0 && price.sellingPrice === 0) {
        count++;
      } else if (price.costPrice > 0 && price.offerPrice > 0 && price.sellingPrice > 0) {
        priceAll[district] = {
          ...price,
          costPrice: parseFloat(price.costPrice),
          offerPrice: parseFloat(price.offerPrice),
          sellingPrice: parseFloat(price.sellingPrice),
        };
      }
    });
    console.log('priceAll:', priceAll);
    if (product.categoryId === '') {
      alert('some problem, try logout and login...');
      return;
    } else if (
      product.name === '' ||
      product.description == '' ||
      // product.img === '' ||
      product.imgUrlLocal === '' ||
      product.quantity === 0 ||
      product.unit === '' ||
      Object.keys(product.price).length === 0
    ) {
      alert('Invalid Input, Please fill all the values');
      return;
    } else if (count === districts.length) {
      alert('Invalid price, please provide price for atleast 1 district');
      return;
    }
    // console.log('isEdit:', isEdit, product);
    if (isEdit) {
      if (product.imgUrlLocal.includes('blob') && product.img !== '') {
        // image
        const storageRef = ref(storage, `products/${product.img.name}`);
        uploadBytes(storageRef, product.img)
          .then(() => getDownloadURL(storageRef))
          .then((url) => {
            const updatedProduct = {
              categoryId: product.categoryId,
              coverImg: url,
              description: product.description,
              isAvailable: product.isAvailable,
              minStock: parseInt(product.minStock),
              name: product.name,
              quantity: parseFloat(product.quantity),
              unit: product.unit,
              price: priceAll,
            };
            updateDoc(doc(db, 'products', product.id), updatedProduct)
              .then(() => {
                const storage = getStorage();
                const fileRef = ref(storage, product.coverImg);
                deleteObject(fileRef)
                  .then(() => {
                    console.log('File deleted successfully');
                  })
                  .catch((e) => console.log(e));
                setProducts((prevState) => {
                  const arr = [...prevState];
                  const index = arr.findIndex((cat) => cat.id === product.id);
                  const updatedCategory = {
                    ...arr[index],
                    ...updatedProduct,
                  };
                  arr[index] = updatedCategory;
                  return [...arr];
                });
                handleClose();
              })
              .catch((e) => console.log('addDoc err:', e));
          })
          .catch((e) => console.log('Products.js[saveHandler] img err', e));
      } else {
        const updatedProduct = {
          categoryId: product.categoryId,
          coverImg: product.coverImg, // here imgUrlLocal will have the original uri
          description: product.description,
          isAvailable: product.isAvailable,
          minStock: parseInt(product.minStock),
          name: product.name,
          quantity: parseFloat(product.quantity),
          unit: product.unit,
          price: priceAll,
        };
        updateDoc(doc(db, 'products', product.id), updatedProduct)
          .then(() => {
            setProducts((prevState) => {
              const arr = [...prevState];
              const index = arr.findIndex((cat) => cat.id === product.id);
              const updatedCategory = {
                ...arr[index],
                ...updatedProduct,
              };
              arr[index] = updatedCategory;
              return [...arr];
            });
            handleClose();
          })
          .catch((e) => console.log('addDoc err:', e));
      }
    } else {
      const storageRef = ref(storage, `products/${product.img.name}`);
      uploadBytes(storageRef, product.img)
        .then(() => getDownloadURL(storageRef))
        .then((url) => {
          const newProduct = {
            categoryId: product.categoryId,
            coverImg: url,
            description: product.description,
            isAvailable: product.isAvailable,
            minStock: parseInt(product.minStock),
            name: product.name,
            quantity: parseFloat(product.quantity),
            unit: product.unit,
            price: priceAll,
          };
          addDoc(collection(db, 'products'), newProduct)
            .then((docRef) => {
              console.log('Document written with ID: ', docRef.id);
              newProduct.id = docRef.id;
              setProducts((prevState) => [...prevState, newProduct]);
            })
            .catch((e) => console.log('addDoc err:', e));
        })
        .catch((e) => console.log('Products.js[saveHandler] img err', e));
    }
  };

  return (
    <Container>
      <div className={classes.productHeader}>
        <div className={classes.productHeading}>
          <Typography variant="h4">{category && category.name}</Typography>
          <ArrowForwardIosIcon />
          <Typography variant="h4">Products</Typography>
        </div>
        <Button
          onClick={handleOpen}
          sx={{
            background: ' #9F3239',
            color: '#fff',
            transition: '0.3s',
            '&: hover': {
              background: '#fff',
              color: '#9F3239',
              border: '1px solid #9F3239',
            },
          }}
          variant="contained"
        >
          Add Product
        </Button>
        {open && (
          <ProductModal
            open={open}
            product={product}
            setProduct={setProduct}
            handleOpen={handleOpen}
            handleClose={handleClose}
            saveHandler={saveHandler}
          />
        )}
      </div>
      {products.length === 0 ? (
        <p>No Products</p>
      ) : (
        products.map((product) => (
          <Card sx={{ maxWidth: 345 }} key={product.id}>
            <CardMedia component="img" alt="green iguana" height="150" image={product.coverImg} />
            <CardContent>
              <Stack direction="row" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography gutterBottom variant="h5" component="div" sx={{ margin: 0 }}>
                  {product.name}
                </Typography>
                <MenuIcon type="product" editItem={() => handleEditItem(product)} />
              </Stack>

              <Typography variant="body2" color="text.secondary">
                {product.description}
              </Typography>
            </CardContent>
          </Card>
        ))
      )}
    </Container>
  );
}
