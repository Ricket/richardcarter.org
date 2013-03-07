import java.applet.Applet;
import java.awt.*;
import java.awt.event.*;
import java.util.Random;

public class Snake extends Applet implements Runnable,KeyListener {
    private static final long serialVersionUID = 1L;
    
    public static final int FPS = 30;
    public static final int GAMEAREAWIDTH = 20;
    public static final int GAMEAREAHEIGHT = 20;
    public static final int GAMEAREABGCOLOR = 0xFFFFFF;
    public static final int GAMEAREABORDERCOLOR = 0xFFFFFF;
    public static final int BLOCKSIZE = 16;
    public static final int NUMOFFOODS = 20;
    
    private enum GameState {
    	Normal,
    	Stopped,
    	Quit
    }
    
    public int score;
    
    public static final Random randGen = new Random(System.currentTimeMillis());
    
    Thread drawThread;
    Graphics bbGraphics;
    Image bbImage;
    long lastUpdate;
    long lastMove;
    
    Boolean[] keys;
    GameState state;
    
    Follower snake;
    Food[] foods;
    Point direction;
    Point nextDirection;
    
	@Override
	public void init() {
		setUpWindow();
        resetGame();
	}

	@Override
	public void start() {
        // START DRAWING
        drawThread.start();
	}

	@Override
	public void stop() {
		state = GameState.Quit;
		try {
            drawThread.join();
        } catch(Exception e) {}
	}
    
    private void setUpWindow() {
        this.setBackground(Color.white);
        this.setForeground(Color.black);
        this.addKeyListener(this);
        this.setVisible(true);
        this.setSize(getInsets().left+getInsets().right+GAMEAREAWIDTH*BLOCKSIZE, getInsets().top+getInsets().bottom+GAMEAREAHEIGHT*BLOCKSIZE);
        Dimension dim = getToolkit().getScreenSize();
        Rectangle abounds = getBounds();
        this.setLocation((dim.width - abounds.width) / 2, (dim.height - abounds.height) / 2);
    }
    
    private void clearKeys() {
        synchronized(keys) {
            for(int i=0;i<keys.length;i++) {
                keys[i] = Boolean.FALSE;
            }            
        }
    }
    
    private void setUpBackBuffer() {
        if(bbImage==null)
            bbImage = this.createImage(this.getWidth(), this.getHeight());
        if(drawThread==null)
            drawThread = new Thread(this);
    }
    
    private void resetGame() {
        if(keys==null) keys = new Boolean[256];
        clearKeys();
        
        if(bbImage != null) {
            synchronized(bbImage) {
                bbImage = null;
            }
        }
        setUpBackBuffer();
        
        score = 1;
        
        // SNAKE
        snake = new Follower(0,0,true);
        direction = new Point(1,0);
        nextDirection = direction;
        
        // FOOD
        foods = new Food[NUMOFFOODS];
        for(int i=0;i<foods.length;i++) {
            foods[i] = new Food(0,0);
            foods[i].shuffle(snake);
        }
        
        // STATE
        state = GameState.Normal;
        
    }
    
    public void paint(Graphics g) {
        draw(g);
    }
    
    public void update(Graphics g) {
        draw(g);
    }
    
    public void run() {
        while(state != GameState.Quit) {
            lastUpdate = System.currentTimeMillis();
            checkKeys();
            processEvents();
            repaint();
            try {Thread.sleep(Math.max(1,lastUpdate+1000/FPS-System.currentTimeMillis()));}
            catch(Exception e) {}
        }
    }
    
    public void checkKeys() {
        if(keys==null) return;
        // check for key presses...
        // remember - TRUE means pressed, null means acknowledged, FALSE means released
        synchronized(keys) {
            //if(state==STATE_STOPPED) return;
            
            if(keys[KeyEvent.VK_UP]==Boolean.TRUE && direction.y!=1) {
                nextDirection = new Point(0,-1);
                keys[KeyEvent.VK_UP] = null;
            }
            else if(keys[KeyEvent.VK_LEFT]==Boolean.TRUE && direction.x!=1) {
                nextDirection = new Point(-1,0);
                keys[KeyEvent.VK_LEFT] = null;
            }
            else if(keys[KeyEvent.VK_RIGHT]==Boolean.TRUE && direction.x!=-1) {
                nextDirection = new Point(1,0);
                keys[KeyEvent.VK_RIGHT] = null;
            }
            else if(keys[KeyEvent.VK_DOWN]==Boolean.TRUE && direction.y!=-1) {
                nextDirection = new Point(0,1);
                keys[KeyEvent.VK_DOWN] = null;
            }
            else if(keys[KeyEvent.VK_R]==Boolean.TRUE) {
                resetGame();
            }
        }
    }
    
    public void processEvents() {
        if(snake==null || foods==null) return;
        if(hasFocus()) {
        	if(state==GameState.Normal && lastUpdate>lastMove+150) {
	            direction = nextDirection;
	            snake.moveBy(direction.x, direction.y);
	            if(snake.collidesWithSelf()) gameOver();
	            else {
	                for(int i=0;i<foods.length;i++) {
	                    if(foods[i].intersects(snake)) {
	                        snake.eat();
	                        foods[i].shuffle(snake);
	                    }
	                }
	            }
	            lastMove = lastUpdate;
	        }
        }
        
    }
    
    public void gameOver() {
        state = GameState.Stopped;
    }
    
    public void incrementScore() {
        score++;
    }
    
    public void draw(Graphics g) {
        if(bbImage==null) return;
        synchronized(bbImage) {
            if(bbImage==null || g==null) return;
            bbGraphics = bbImage.getGraphics();
            bbGraphics.clearRect(0,0,getWidth(),getHeight());
            //----------------------------------
            
            snake.draw(bbGraphics);
            for(int i=0;i<foods.length;i++)
                foods[i].draw(bbGraphics);
            
            bbGraphics.setColor(Color.BLACK);
            bbGraphics.drawString("Score: "+score, 0, 10);
            
            if(state == GameState.Stopped) {
            	bbGraphics.setColor(Color.BLACK);
            	bbGraphics.drawString("Press R to restart", 50, 50);
            }
            
            if (!hasFocus()) {
                bbGraphics.setColor(Color.BLACK);
                bbGraphics.fillRect(100, 100, 80, 20);
                bbGraphics.setColor(Color.WHITE);
                bbGraphics.drawString("Click to focus", 103, 115);
            }
            
            //----------------------------------
            bbGraphics.dispose();
            g.drawImage(bbImage,0,0,null);
        }

    }
    
    public void keyTyped(KeyEvent e) {}
    public void keyPressed(KeyEvent e) {
        if(keys==null) return;
        synchronized(keys) {
            if(keys[e.getKeyCode()]==Boolean.FALSE) keys[e.getKeyCode()] = Boolean.TRUE;
        }
    }
    public void keyReleased(KeyEvent e) {
        if(keys==null) return;
        synchronized(keys) {
            keys[e.getKeyCode()] = Boolean.FALSE;            
        }
    }
    
    protected class Head extends Follower {

		public Head(int x, int y) {
			super(x, y);
		}
		
		public void draw(Graphics g) {
            g.setColor(Color.blue);
            g.fillOval(getInsets().left+pos.x*BLOCKSIZE,getInsets().top+pos.y*BLOCKSIZE,BLOCKSIZE,BLOCKSIZE);
            g.setColor(Color.black);
            g.fillOval(getInsets().left+pos.x*BLOCKSIZE+BLOCKSIZE/4,getInsets().top+pos.y*BLOCKSIZE+BLOCKSIZE/4,BLOCKSIZE/2,BLOCKSIZE/2);
            if(next!=null) next.draw(g);
        }
    	
    }
    
    protected class Follower {
        Point pos;
        Follower next;
        boolean head;
        
        public Follower(int x, int y, boolean head) {
            pos = new Point(x,y);
            this.head = head;
        }
        
        public Follower(int x, int y) {
            this(x,y,false);
        }
        
        public void draw(Graphics g) {
            g.setColor(Color.blue);
            g.fillOval(getInsets().left+pos.x*BLOCKSIZE,getInsets().top+pos.y*BLOCKSIZE,BLOCKSIZE,BLOCKSIZE);
            if(head) {
                g.setColor(Color.black);
                g.fillOval(getInsets().left+pos.x*BLOCKSIZE+BLOCKSIZE/4,getInsets().top+pos.y*BLOCKSIZE+BLOCKSIZE/4,BLOCKSIZE/2,BLOCKSIZE/2);
            }
            if(next!=null) next.draw(g);
        }
        
        public void moveTo(int x, int y) {
            if(pos.x==x&&pos.y==y) return;
            if(next!=null) next.moveTo(pos.x,pos.y);
            pos.x=x;
            pos.y=y;
            
            if(x<0||y<0||x>GAMEAREAWIDTH-1||y>GAMEAREAHEIGHT-1) gameOver();
        }
        
        public void moveBy(int x, int y) {
            this.moveTo(pos.x+x,pos.y+y);
        }
        
        public void eat() {
            if(next==null) {
                next = new Follower(pos.x,pos.y);
                incrementScore();
            } else {
                next.eat();
            }
        }
        
        public boolean collidesWithSelf() {
            return (next==null)? false : next.intersects(pos.x,pos.y);
        }
        
        public boolean intersects(int x, int y) {
            if(pos.x==x && pos.y==y) return true;
            else return (next==null)?false:next.intersects(x, y);
        }
    }
    
    protected class Food {
        Point pos;
        public Food(int x, int y) {
            pos = new Point(x,y);
        }
        
        public boolean intersects(Follower f) {
            return f.intersects(pos.x,pos.y);
        }
        
        public void shuffle(Follower f) {
            this.shuffle(new Follower[]{f});
        }
        
        public void shuffle(Follower[] fs) {
            if(fs.length<1) return;
            LABEL1:
                while(true) {
                    pos.x = randGen.nextInt(GAMEAREAWIDTH);
                    pos.y = randGen.nextInt(GAMEAREAHEIGHT);
                    for(int i=0;i<fs.length;i++)
                        if(fs[i].intersects(pos.x, pos.y)) continue LABEL1;
                    
                    break;
                }
        }
        
        public void draw(Graphics g) {
            g.setColor(Color.green);
            g.fillOval(getInsets().left+pos.x*BLOCKSIZE,getInsets().top+pos.y*BLOCKSIZE,BLOCKSIZE,BLOCKSIZE);
        }
    }

}
