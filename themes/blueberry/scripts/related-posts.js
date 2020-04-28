var assign = require('lodash.assign');
var striptags = require('striptags');
// var first_image = require('first_image');

function addCount(array, searchProperty, newProperty) {
  return array.reduce(function(newArray, item) {
    var i = objectArrayIndexOf(newArray, item[searchProperty], searchProperty);
    if(i === -1){
      item[newProperty]  = 1;
      newArray.push(item);
    }else{
      newArray[i][newProperty]  = newArray[i][newProperty] + 1;
    }
    return newArray;
  }, []);
}

function objectArrayIndexOf(array, searchTerm, property) {
  for(var i = 0; i < array.length; i++){
    if (array[i][property] === searchTerm) return i;
  }
  return -1;
}

function dynamicSort(property, isAscending) {
  var sortOrder = -1;
  if(isAscending) sortOrder = 1;
  return function (a, b) {
    var result = (a[property] < b[property]) ? -1 :
                 (a[property] > b[property]) ? 1 : 0;
    return result * sortOrder;
  };
}

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex ;
  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}

function getProductImageSrc(productId, isThumb){
  // Find product with specific id property
  var products = this.site.data.product_list;
  function isMyProduct(product) { return product.id === productId; } // predicate
  var product = products.find(isMyProduct) 

  // If product found
  if (typeof product !== "undefined"){
    var src = product.image_link;

    // Modify the src if thumbnail requested
    if (typeof isThumb !== "undefined"){
      const image_version = hexo.extend.helper.get('image_version').bind(this);
      src = image_version(src, {prefix: 'small'});
    }
    
    return src;
  }
  return '';
}

function listRelatedPosts(options) {
  if (!options) {
    options = {};
  }

  options = assign({
    maxCount: 5,
    pClass: 'related-posts-none',
    ulClass: 'related-posts',
    liClass: 'related-posts-item',
    aClass: 'related-posts-link',
    thumbClass: 'related-posts-thumb',
    generateAbstract: false,
    abstractClass: 'related-posts-item-abstract',
    abstractLength: 110,
    orderBy: 'date',
    isAscending: false
  }, options);

  var orderOption = ['date', 'random'];
  if(orderOption.indexOf(options.orderBy) === -1){
    options.orderBy = 'date';
  }

  var postList = [];
  this.post.tags.each(function(tag){
    tag.posts.each(function(post){
      postList.push(post);
    });
  });

  postList = addCount(postList, '_id', 'count');

  var thisPostPosition = objectArrayIndexOf(postList, this.post._id, '_id');
  postList.splice(thisPostPosition, 1);

  if(options.orderBy === 'random'){
    shuffle(postList);
  } else {
    postList.sort(dynamicSort(options.orderBy, options.isAscending));
  }
  postList.sort(dynamicSort('count', false));

  var result = '';
  var root = this.config.root;
  var count = Math.min(options.maxCount, postList.length);


  if (count === 0){
    result += '<p class="' + options.pClass + '">No related post.</p>';
  } else {
    result += '<ul class="' + options.ulClass + '">';

    const get_product_image_src = hexo.extend.helper.get('get_product_image_src').bind(this);
    var src = get_product_image_src(this.post.product_id, true);

    var imageHTML = '<span class="small" style="background-image: url(' + src + ')"></span>';
    if (options.generateAbstract) {
      for (var i = 0; i < count; i++) {
        result += '<li class="' + options.liClass + '">' + '<a class="' + options.aClass + '" href="' + root + postList[i].path + '">' + imageHTML + postList[i].title + '</a><div class="' + options.abstractClass + '">' + striptags(postList[i].content).substring(0, options.abstractLength) + '</div></li>';
      }
    } else {
      for (var i = 0; i < count; i++) {
        result += '<li class="' + options.liClass + '">' + '<a class="' + options.aClass + '" href="' + root + postList[i].path + '">' + imageHTML + postList[i].title + '</a></li>';
      }
    }
    result += '</ul>';
  }

  return result;
}

hexo.extend.helper.register('list_related_posts', listRelatedPosts);
hexo.extend.helper.register('get_product_image_src', getProductImageSrc);