const fs = require('fs');
const path = require('path');
const db = require('./index');

const BLOG_POSTS = [
  ['Bitcoin Reaches New All-Time High', 'Bitcoin surpassed $100,000 USD this week, consolidating itself as the most valuable digital asset in the world. Analysts attribute this increase to greater institutional adoption and reduced supply following the last halving.', 'Market', 'CryptoDesk', '["Bitcoin","BTC","Price"]', 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=400'],
  ['Ethereum 2.0: The Future of Proof-of-Stake', 'Ethereum\'s transition to the proof-of-stake consensus mechanism has reduced energy consumption by 99.95%. Staking has become a popular way to earn passive returns on ETH.', 'Technology', 'ETH Team', '["Ethereum","ETH","PoS"]', 'https://images.unsplash.com/photo-1622630998477-20aa696ecb05?w=400'],
  ['DeFi: Opportunities and Risks in 2026', 'Decentralized finance continues to grow with more than $200 billion in total value locked. We analyze the most promising protocols and the risks investors should consider.', 'DeFi', 'DeFi Analyst', '["DeFi","Finance","Yield"]', 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400'],
  ['NFTs: Trend or Digital Revolution?', 'The NFT market has evolved beyond digital images. We explore use cases in gaming, music, digital real estate, and how creators are monetizing their work.', 'NFT', 'Digital Arts', '["NFT","Art","Web3"]', 'https://images.unsplash.com/photo-1645378999013-95abebf5f3c1?w=400'],
  ['Crypto Regulation: Global Guide 2026', 'Governments around the world are implementing regulatory frameworks for cryptocurrencies. This guide summarizes the current state in Europe, the United States, Asia, and Latin America.', 'Regulation', 'Legal Team', '["Regulation","Legal","Government"]', 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400'],
  ['Complete Guide to Crypto Wallets', 'Everything you need to know to choose and set up your wallet: hardware wallets, software wallets, custodial vs non-custodial, and best security practices.', 'Education', 'Security Expert', '["Wallet","Security","Guide"]', 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400'],
];

function initDb() {
  try {
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    db.exec(schema);

    const { count } = db.prepare('SELECT COUNT(*) as count FROM blog_posts').get();
    if (count === 0) {
      const insert = db.prepare(
        'INSERT INTO blog_posts (title, content, category, author, tags, image_url) VALUES (?, ?, ?, ?, ?, ?)'
      );
      const insertMany = db.transaction((posts) => {
        for (const post of posts) insert.run(...post);
      });
      insertMany(BLOG_POSTS);
    }

    console.log('✅ Base de datos SQLite lista →', require('path').join(__dirname, '../database.sqlite'));
  } catch (err) {
    console.error('❌ Error al inicializar la DB:', err.message);
  }
}

module.exports = { initDb };

// Permite correrlo directamente: node db/init.js
if (require.main === module) {
  initDb();
  process.exit(0);
}
