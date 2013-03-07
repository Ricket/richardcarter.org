/* FallingBlocks.java
 * Two-player Falling Blocks game
 * Released without a license:
 *    You are free to do whatever you
 *    want with this source code.
 * Author:        Richard Carter
 * Last modified: 4/19/07
 * IDE used:      Eclipse JDK v3.2.2 / Java SDK v1.6.0_01 (should run under Java 1.4)
 * Purpose:       To allow two players to play a game of Falling Blocks.
 */

import java.awt.*;
import java.awt.event.*;
import java.awt.geom.Rectangle2D;
import java.util.Random;

public class FallingBlocks extends Frame implements Runnable,WindowListener,KeyListener {
    private static final long serialVersionUID = -6773388040204011141L;
    
    // GAME SETTINGS //
    public static final int FPS = 30;
    public static final int GAMEAREAWIDTH = 10;
    public static final int GAMEAREAHEIGHT = 20;
    public static final int GAMEAREABGCOLOR = 0xFFFFFF;
    public static final int GAMEAREABORDERCOLOR = 0xFFFFFF;
    public static final int BLOCKSIZE = 16;
    
    // STATE CONSTANTS //
    public static final int STATE_PRESSAKEY = 0;
    public static final int STATE_READY = 1;
    public static final int STATE_NORMAL = 2;
    public static final int STATE_PAUSE_ELIMINATINGLINES = 3;
    public static final int STATE_PAUSE_USER = 4;
    public static final int STATE_GAMEOVER = 5;
    
    // BLOCK IDS //
    public static final int BLOCK_I = 0;
    public static final int BLOCK_J = 1;
    public static final int BLOCK_L = 2;
    public static final int BLOCK_O = 3;
    public static final int BLOCK_S = 4;
    public static final int BLOCK_T = 5;
    public static final int BLOCK_Z = 6;
    
    Player player1;
    Player player2;
    
    int globalState;

    // BACK BUFFERED DRAWING VARIABLES //
    Thread drawThread;
    Graphics bbGraphics;
    Image bbImage;
    long lastUpdate;

    public static final Random randGen = new Random(System.currentTimeMillis());
    
    // KEYPRESS BUFFER //
    // Notice type "Boolean[]", not "boolean[]"
    // This is done intentionally so that I can utilize the
    // null state that only exists in Boolean.
    Boolean[] keys;
    
    public static void main(String[] args) {
        new FallingBlocks();
        System.exit(0);
    }
    
    public FallingBlocks() {
        this.setVisible(false);
        setUpWindow();
        
        resetGame();
       
        // START DRAWING
        drawThread.start();
        
        try {
            drawThread.join();
        } catch(Exception e) {}
    }
    
    /* sets up the Frame */
    private void setUpWindow() {
        this.setTitle("Falling Blocks");
        this.setResizable(false);
        this.setBackground(Color.white);
        this.setForeground(Color.black);
        this.addWindowListener(this);
        this.addKeyListener(this);
        this.setVisible(true);
        this.setSize(getInsets().left+getInsets().right+GAMEAREAWIDTH*BLOCKSIZE*2+90,getInsets().top+getInsets().bottom+GAMEAREAHEIGHT*BLOCKSIZE);
        Dimension dim = getToolkit().getScreenSize();
        Rectangle abounds = getBounds();
        this.setLocation((dim.width - abounds.width) / 2, (dim.height - abounds.height) / 2);
    }
    
    /* clears the key buffer */
    private void clearKeys() {
        if(keys==null) return;
        synchronized(keys) {
            for(int i=0;i<keys.length;i++) {
                keys[i] = Boolean.FALSE;
            }           
        }
    }
    
    /* sets up the back buffer */
    private void setUpBackBuffer() {
        if(bbImage==null)
            bbImage = this.createImage(this.getWidth(), this.getHeight());
        if(drawThread==null)
            drawThread = new Thread(this);
    }
    
    /* resets variables, initializes everything */
    private void resetGame() {
        if(keys==null) keys = new Boolean[256];
        clearKeys();
        
        if(bbImage != null) {
            synchronized(bbImage) {
                bbImage = null;
            }
        }
        setUpBackBuffer();
        
        player1 = new Player();
        player2 = new Player();
        
        globalState = STATE_PRESSAKEY;
    }
    
    public void paint(Graphics g) {
        draw(g);
    }
    
    public void update(Graphics g) {
        draw(g);
    }
    
    /* back buffer thread's run() method */
    public void run() {
        // main game loop //
        while(!Thread.currentThread().isInterrupted()) {
            lastUpdate = System.currentTimeMillis();
            checkKeys();
            processEvents();
            repaint();
            // sleep for up to (1000/FPS) milliseconds
            try {Thread.sleep(Math.max(1,lastUpdate+1000/FPS-System.currentTimeMillis()));}
            catch(Exception e) {}
        }
    }
    
    /* perform events based on key presses */
    public void checkKeys() {
        if(keys==null) return;
        synchronized(keys) {
            if(keys[KeyEvent.VK_ESCAPE]==Boolean.TRUE) {
                this.dispose(); // exit
            }
            
            // game is waiting for both players to press a key
            if(globalState==STATE_PRESSAKEY) {
                if(keys[KeyEvent.VK_W]==Boolean.TRUE || keys[KeyEvent.VK_A]==Boolean.TRUE || keys[KeyEvent.VK_S]==Boolean.TRUE || keys[KeyEvent.VK_D]==Boolean.TRUE) player1.state = STATE_READY;
                if(keys[KeyEvent.VK_UP]==Boolean.TRUE || keys[KeyEvent.VK_LEFT]==Boolean.TRUE || keys[KeyEvent.VK_RIGHT]==Boolean.TRUE || keys[KeyEvent.VK_DOWN]==Boolean.TRUE) player2.state = STATE_READY;
               
                if(player1.state==STATE_READY && player2.state==STATE_READY) {
                    player1.state = STATE_NORMAL;
                    player2.state = STATE_NORMAL;
                    globalState = STATE_NORMAL;
                }
                if(globalState==STATE_NORMAL)
                    clearKeys();
                       
            }
            
            // game is over
            else if(globalState==STATE_GAMEOVER) {
                for(int i=0;i<keys.length;i++)
                    if(keys[i]==Boolean.TRUE) resetGame();
            }
            
            // game is in progress
            else if(globalState==STATE_NORMAL) {
                
                // if P is pressed
                if(keys[KeyEvent.VK_P]==Boolean.TRUE) {
                    // pause the game and both players
                    globalState = STATE_PAUSE_USER;
                    player1.state = STATE_PAUSE_USER;
                    player2.state = STATE_PAUSE_USER;
                    keys[KeyEvent.VK_P] = null;
                    return;
                }
               
                // if player 1 is playing, not waiting
                if(player1.state==STATE_NORMAL) {
                    // if W (up) is pressed
                    if(keys[KeyEvent.VK_W]==Boolean.TRUE) {
                        player1.currBlock.rotate(false);
                        keys[KeyEvent.VK_W] = null;
                    }
                    boolean keyPressed = false;
                    
                    // if A (left) is pressed
                    if(keys[KeyEvent.VK_A]==Boolean.TRUE && player1.lastKeyPress+200<lastUpdate) {
                        player1.currBlock.translate(-1,0);
                        keyPressed = true;
                    }
                    
                    // if D (right) is pressed
                    if(keys[KeyEvent.VK_D]==Boolean.TRUE && player1.lastKeyPress+200<lastUpdate) {
                        player1.currBlock.translate(1,0);
                        keyPressed = true;
                    }
                    
                    // if S (down) is pressed
                    if(keys[KeyEvent.VK_S]==Boolean.TRUE && player1.lastKeyPress+200<lastUpdate) {
                        if(player1.currBlock.translate(0,1)) player1.lastTick = lastUpdate;
                        keyPressed = true;
                    }
                    
                    if(keyPressed) player1.lastKeyPress = lastUpdate;
                    if(keys[KeyEvent.VK_A]==Boolean.FALSE && keys[KeyEvent.VK_D]==Boolean.FALSE && keys[KeyEvent.VK_S]==Boolean.FALSE) player1.lastKeyPress = 0;
                }
               
                if(player2.state==STATE_NORMAL) {
                    // if up is pressed
                    if(keys[KeyEvent.VK_UP]==Boolean.TRUE) {
                        player2.currBlock.rotate(false);
                        keys[KeyEvent.VK_UP] = null;
                    }
                    boolean keyPressed = false;
                    
                    // if left is pressed
                    if(keys[KeyEvent.VK_LEFT]==Boolean.TRUE && player2.lastKeyPress+200<lastUpdate) {
                        player2.currBlock.translate(-1,0);
                        keyPressed = true;
                    }
                    
                    // if right is pressed
                    if(keys[KeyEvent.VK_RIGHT]==Boolean.TRUE && player2.lastKeyPress+200<lastUpdate) {
                        player2.currBlock.translate(1,0);
                        keyPressed = true;
                    }
                    
                    // if down is pressed
                    if(keys[KeyEvent.VK_DOWN]==Boolean.TRUE && player2.lastKeyPress+200<lastUpdate) {
                        if(player2.currBlock.translate(0,1)) player2.lastTick = lastUpdate;
                        keyPressed = true;
                    }
                    
                    if(keyPressed) player2.lastKeyPress = lastUpdate;
                    if(keys[KeyEvent.VK_LEFT]==Boolean.FALSE && keys[KeyEvent.VK_RIGHT]==Boolean.FALSE && keys[KeyEvent.VK_DOWN]==Boolean.FALSE) player2.lastKeyPress = 0;
                }
               
            }
            
            // user has paused the game
            else if(globalState==STATE_PAUSE_USER) {
                // if P is pressed, resume game
                if(keys[KeyEvent.VK_P]==Boolean.TRUE) {
                    globalState = STATE_NORMAL;
                    player1.state = STATE_NORMAL;
                    player2.state = STATE_NORMAL;
                    keys[KeyEvent.VK_P] = null;
                }
            }
        }
    }
    
    /* eliminate one solid row or fill an empty row
     * (by dropping all spaces above it down by one) */
    public boolean eliminateARow(Player plr) {
        int topLine = -1;
        
        // find the topmost non-empty row
        for(int y=0;y<GAMEAREAHEIGHT;y++) {
            for(int x=0;x<GAMEAREAWIDTH;x++)
                if(plr.gameAreaColors[y][x]!=GAMEAREABGCOLOR)
                    topLine = y;
            if(topLine!=-1) break;
        }
        if(topLine==-1) // playing field is empty
            return false;
        else {
            int emptyLine = -1;
            // find an empty line below the topLine
            OUTERLOOP1:
            for(int y=topLine;y<GAMEAREAHEIGHT;y++) {
                for(int x=0;x<GAMEAREAWIDTH;x++) {
                    if(plr.gameAreaColors[y][x]!=GAMEAREABGCOLOR)
                        continue OUTERLOOP1;
                }
                emptyLine = y;
                break;
            }
            // if there is an empty line, shuffle everything down one
            if(emptyLine>-1) {
                for(int y=emptyLine;y>=topLine;y--) {
                    for(int x=0;x<GAMEAREAWIDTH;x++)
                        plr.gameAreaColors[y][x] = plr.gameAreaColors[y-1][x];
                }
            }
            // else, search for a full line and remove it
            else {
                int fullLine = -1;
                // find a filled line
                OUTERLOOP2:
                for(int y=topLine;y<GAMEAREAHEIGHT;y++) {
                    for(int x=0;x<GAMEAREAWIDTH;x++) {
                        if(plr.gameAreaColors[y][x]==GAMEAREABGCOLOR)
                            continue OUTERLOOP2;
                    }
                    fullLine = y;
                    break;
                }
                if(fullLine==-1) {
                    return false;
                } 
                // a filled line was found, increment score and remove the line
                else {
                    plr.incrementScore(1);
                    for(int x=0;x<GAMEAREAWIDTH;x++)
                        plr.gameAreaColors[fullLine][x] = GAMEAREABGCOLOR;
                }
            }
        }
        return true;
    }
    
    /* process events for a specific player */
    private void processEvents(Player plr, long timeNow) {
        // if lines are being eliminated and it has been .2 seconds since the last elimination
        if(plr.state==STATE_PAUSE_ELIMINATINGLINES && plr.lastTick<timeNow-200) {
            // try to eliminate a line, if there is nothing left to do...
            if(!eliminateARow(plr)) {
                // ... then bring out the next block and check for game over
                plr.bringOutNextBlock();
                if(plr.state==STATE_GAMEOVER) {
                    if(player1.state==STATE_GAMEOVER && player2.state==STATE_GAMEOVER)
                        globalState = STATE_GAMEOVER;
                }
                else plr.state=STATE_NORMAL;
            }
            plr.lastTick = timeNow;
        }
        // if the player is playing, and it has been tickInterval milliseconds since the last event
        else if(plr.state==STATE_NORMAL && plr.lastTick<timeNow-plr.tickInterval) {
            // try to move the current block down one, if it fails...
            if(!plr.currBlock.translate(0,1)) {
                // then the block must be at the bottom, so draw the block into the permanent
                // gameAreaColors and eliminate any necessary lines
                plr.gameAreaColors = plr.currBlock.draw(plr.gameAreaColors);
                plr.currBlock = null;
                plr.state = STATE_PAUSE_ELIMINATINGLINES;
            }
            plr.lastTick = timeNow;
        }
    }
    
    /* process events for both players */
    public void processEvents() {
        // don't process events while paused
        if(globalState==STATE_PAUSE_USER) return;
       
        processEvents(player1,lastUpdate);
        processEvents(player2,lastUpdate);
    }
    
    /* draw the window's contents */
    public void draw(Graphics g) {
        if(bbImage==null) return;
        // synchronize; bbImage must stay intact throughout this function
        synchronized(bbImage) {
            if(bbImage == null || g == null)
                return;
            
            // get our Graphics object to draw to
            bbGraphics = bbImage.getGraphics();
            
            // clear the back buffer
            bbGraphics.clearRect(0,0,getWidth(),getHeight());
            //----------------------------------
           
            // draw each game area (consisting of the colored blocks)
            drawGameArea(bbGraphics,this.getInsets().left,this.getInsets().top,player1);
            drawGameArea(bbGraphics,this.getWidth()-this.getInsets().left-GAMEAREAWIDTH*BLOCKSIZE,this.getInsets().top,player2);
           
            // draw the players' scores
            bbGraphics.setColor(Color.black);
            bbGraphics.drawString("Player 1:",this.getInsets().left+GAMEAREAWIDTH*BLOCKSIZE+20,this.getInsets().top+20);
            bbGraphics.drawString("Player 2:",this.getInsets().left+GAMEAREAWIDTH*BLOCKSIZE+20,this.getInsets().top+210);
            drawStatus(bbGraphics, player1, 25);
            drawStatus(bbGraphics, player2, 215);
           
           
            if(globalState==STATE_GAMEOVER || globalState==STATE_PAUSE_USER || globalState==STATE_PRESSAKEY) {
                bbGraphics.setFont(new Font("Comic Sans MS",Font.PLAIN,12));
            }
            if(globalState==STATE_GAMEOVER || globalState==STATE_PAUSE_USER) {
                bbGraphics.setColor(Color.black);
                String msg = (globalState==STATE_GAMEOVER)?"Game over":((globalState==STATE_PAUSE_USER)?"[PAUSED]":"");
                Rectangle2D fontBounds = bbGraphics.getFontMetrics().getStringBounds(msg,bbGraphics);
                bbGraphics.fillRect((int)(this.getWidth()/2-fontBounds.getCenterX()),(int)(this.getHeight()/2-fontBounds.getCenterY()),(int)fontBounds.getWidth(),(int)fontBounds.getHeight());
                bbGraphics.setColor(Color.white);
                bbGraphics.drawString(msg,(int)(this.getWidth()/2-fontBounds.getCenterX()),(int)(this.getHeight()/2+fontBounds.getHeight()));
            }
            if(globalState==STATE_PRESSAKEY) { //if(globalState==STATE_PRESSAKEY)
                String msg1 = ("Player 1: "+((player1.state==STATE_READY)?"Ready":"Press an arrow key"));
                Rectangle2D fontBounds1 = bbGraphics.getFontMetrics().getStringBounds(msg1,bbGraphics);
                bbGraphics.setColor(Color.black);
                bbGraphics.fillRect(GAMEAREAWIDTH*BLOCKSIZE/2+getInsets().left-(int)fontBounds1.getCenterX(),(int)this.getHeight()/2-(int)fontBounds1.getCenterY(),(int)fontBounds1.getWidth(),(int)fontBounds1.getHeight());
                bbGraphics.setColor(Color.white);
                bbGraphics.drawString(msg1, GAMEAREAWIDTH*BLOCKSIZE/2+getInsets().left-(int)fontBounds1.getCenterX(),(int)this.getHeight()/2+(int)fontBounds1.getHeight());
               
                String msg2 = ("Player 2: "+((player2.state==STATE_READY)?"Ready":"Press an arrow key"));
                Rectangle2D fontBounds2 = bbGraphics.getFontMetrics().getStringBounds(msg2,bbGraphics);
                bbGraphics.setColor(Color.black);
                bbGraphics.fillRect(getWidth()-getInsets().right-GAMEAREAWIDTH*BLOCKSIZE/2-(int)fontBounds2.getCenterX(),(int)this.getHeight()/2-(int)fontBounds2.getCenterY(),(int)fontBounds2.getWidth(),(int)fontBounds2.getHeight());
                bbGraphics.setColor(Color.white);
                bbGraphics.drawString(msg2, getWidth()-getInsets().right-GAMEAREAWIDTH*BLOCKSIZE/2-(int)fontBounds2.getCenterX(),(int)this.getHeight()/2+(int)fontBounds2.getHeight());
            }
            //----------------------------------
            bbGraphics.dispose();
            g.drawImage(bbImage,0,0,null);
        }
    }
    
    /* draw the player's score */
    public void drawStatus(Graphics g, Player plr, int topOffset) {
        g.setColor(Color.black);
        g.setFont(new Font("Courier New",Font.PLAIN,12));
        // get bounds of a 5-character-wide string
        // (Courier New is a fixed-spacing font so any 5 characters will work, in this case "12345")
        Rectangle2D fontBounds1 = g.getFontMetrics().getStringBounds("12345", g);
       
        // draw the score box and the score in it
        // calculate coordinates based on insets (borders), size of each block, and number of blocks
        int left = this.getInsets().left+GAMEAREAWIDTH*BLOCKSIZE+20;
        int top = this.getInsets().top+topOffset;
        int right = left+50;
        int bottom = top+(int)fontBounds1.getHeight()*2+20;
        g.drawRect(left,top,right-left,bottom-top);
        g.drawString("Score",(int)(left+((right-left)/2)-(fontBounds1.getWidth()/2)),(int)(top+fontBounds1.getHeight()));
        top+=(int)fontBounds1.getHeight()+3;
        bottom+=(int)fontBounds1.getHeight()+3;
        g.drawString(""+plr.score,(int)(left+((right-left)/2)-(fontBounds1.getWidth()/2)),(int)(top+fontBounds1.getHeight()));
       
        // draw the next block preview
        top += (int)fontBounds1.getHeight()+30;
        bottom = top+4*8;
        // left = left;
        right = left+4*8;
        g.setColor(Color.black);
        g.drawRect(left,top,right-left+2,bottom-top+2);
        left++;
        top++;
        for(int y=0;y<plr.nextBlockPreview.length;y++)
            for(int x=0;x<plr.nextBlockPreview[0].length;x++) {
                g.setColor(new Color(plr.nextBlockPreview[y][x]));
                g.fillRect(x*8+left+1,y*8+top+1,8-2,8-2);
            }
    }
    
    /* draw a game area */
    public void drawGameArea(Graphics g, int xc, int yc, Player plr) {
        // temporary game area, which combines the permanent blocks with the current (dynamic) block
        int[][] tempAreaColors;
        if(plr.currBlock!=null) tempAreaColors = plr.currBlock.draw(plr.gameAreaColors);
        else tempAreaColors = plr.gameAreaColors;
        
        // loop through and draw each block
        for(int x = 0;x<GAMEAREAWIDTH;x++) {
            for(int y=0;y<GAMEAREAHEIGHT;y++) {
                g.setColor(new Color(GAMEAREABORDERCOLOR));
                g.fillRect(xc+(x*BLOCKSIZE),yc+(y*BLOCKSIZE),BLOCKSIZE,BLOCKSIZE);
                g.setColor(new Color(tempAreaColors[y][x]));
                g.fillRect(xc+(x*BLOCKSIZE)+1,yc+(y*BLOCKSIZE)+1,BLOCKSIZE-2,BLOCKSIZE-2);
            }
        }
        
        // draw a black border around the game area
        g.setColor(Color.black);
        g.drawRect(xc,yc,GAMEAREAWIDTH*BLOCKSIZE,GAMEAREAHEIGHT*BLOCKSIZE);
    }
    
    /* get a new block based on the block ID
     * (used for mapping a random number to a block type) */
    public Block getNewBlock(int type,Player plr) {
        switch(type) {
            case BLOCK_I:
                return new BlockI(plr);
            case BLOCK_J:
                return new BlockJ(plr);
            case BLOCK_L:
                return new BlockL(plr);
            case BLOCK_O:
                return new BlockO(plr);
            case BLOCK_S:
                return new BlockS(plr);
            case BLOCK_T:
                return new BlockT(plr);
            case BLOCK_Z:
                return new BlockZ(plr);
            default:
                return null;
        }
    }
    
    /* WindowListener methods */
    public void windowActivated(WindowEvent e) {}
    public void windowClosed(WindowEvent e) {}
    public void windowClosing(WindowEvent e) { drawThread.interrupt(); this.dispose(); System.exit(0); }
    public void windowDeactivated(WindowEvent e) {}
    public void windowDeiconified(WindowEvent e) {}
    public void windowIconified(WindowEvent e) {}
    public void windowOpened(WindowEvent e) {}
    
    /* KeyListener methods */
    public void keyTyped(KeyEvent e) {}
    // Note: I use "null" as a state between TRUE and FALSE.
    // "null" signifies the time in which the key's corresponding event has
    // been handled by the event processing methods (above) but it is not yet released.
    // Because Windows operating systems send multiple keyPressed events when a key is held,
    // keyPressed will only set the key to TRUE if it is already FALSE (released).
    public void keyPressed(KeyEvent e) {
        if(keys==null) return;
        synchronized(keys) {
            if(keys[e.getKeyCode()]==Boolean.FALSE)
                keys[e.getKeyCode()] = Boolean.TRUE;
        }
    }
    public void keyReleased(KeyEvent e) {
        if(keys==null) return;
        synchronized(keys) {
            keys[e.getKeyCode()] = Boolean.FALSE;            
        }
    }
    
    /* represents one player, of which there are two */
    protected class Player {
        // the game area
        public int[][] gameAreaColors;
        // the interval between each time the current block
        // is shifted down one space (in milliseconds)
        public int tickInterval = 1000;
       
        // one of the possible STATE_* constants
        public int state;
        
        // the player's score (number of rows filled)
        public int score;
        
        // current block, next block, and preview of the next block
        public Block currBlock;
        public int nextBlockType;
        public int[][] nextBlockPreview;
       
        public long lastKeyPress; // used to perform key press responses
        public long lastTick;     // used to perform game events
       
        public Player() {
            this.score = 0;
            
            // create the game area, make it "empty" by filling with
            // the GAMEAREABGCOLOR
            this.gameAreaColors = new int[GAMEAREAHEIGHT][GAMEAREAWIDTH];
            for(int x=0;x<GAMEAREAWIDTH;x++)
                for(int y=0;y<GAMEAREAHEIGHT;y++)
                    this.gameAreaColors[y][x] = GAMEAREABGCOLOR;
            
            // set the next block
            this.nextBlockType = randGen.nextInt(7);
            this.bringOutNextBlock();
            
            // enter the waiting-for-key-press state
            this.state = STATE_PRESSAKEY;
        }
       
        /* increment the player's score by amount and calculate the tickInterval */
        public void incrementScore(int amount) {
            this.score += amount;
            this.tickInterval = 1000-(score*30);
        }
       
        /* move the next block into the current one, and then select a random next block */
        public void bringOutNextBlock() {
            this.currBlock = getNewBlock(this.nextBlockType,this);
            this.nextBlockType = randGen.nextInt(7);
            
            // generate a block preview for the next block
            Block tempBlk = getNewBlock(this.nextBlockType,this);
            this.nextBlockPreview = new int[(tempBlk.localSpace).length][(tempBlk.localSpace)[0].length];
            for(int y=0;y<(tempBlk.localSpace).length;y++)
                for(int x=0;x<(tempBlk.localSpace)[0].length;x++)
                    this.nextBlockPreview[y][x] = (((tempBlk.localSpace)[y][x])?tempBlk.color:GAMEAREABGCOLOR);
           
            // enter the normal state, and then check to see if the block collides;
            // if so, enter the game over state
            this.state = STATE_NORMAL;
            if(!currBlock.translate(0,0)) this.state = STATE_GAMEOVER;
        }
    }
    
    /* base class for a block */
    abstract protected class Block {
        public int color;
        public boolean[][] localSpace;
        public int xloc,yloc;
        protected Player owner;
        protected boolean flips;
        protected boolean[][] flippedSpace;        
        
        // rotates the block
        // if CCW is true, rotates it counter-clockwise; else, rotates it clockwise
        // if the block flips, CCW is ignored
        // see Figure 3 for the distinction between rotating and flipping
        public synchronized boolean rotate(boolean CCW) {
            if(flips) {
                // if it is able to flip without colliding...
                if(!collision(flippedSpace,owner.gameAreaColors)) {
                    // ... then swap this.localSpace and this.flippedSpace
                    boolean[][] temp = this.localSpace;
                    this.localSpace = flippedSpace;
                    this.flippedSpace = temp;
                    return true;
                } else {
                    return false;
                }
            } else { // it does not flip; rotate it
                boolean[][] temp = new boolean[localSpace.length][localSpace[0].length];
                if(CCW) {
                    for(int y=0;y<localSpace.length;y++)
                        for(int x=0;x<localSpace[y].length;x++)
                            temp[y][x] = this.localSpace[x][3-y];
                } else {
                    for(int y=0;y<localSpace.length;y++)
                        for(int x=0;x<localSpace[y].length;x++)
                            temp[y][x] = this.localSpace[(localSpace.length-1)-x][y];
                }
               
                // if the new rotated block collides with existing blocks, don't rotate it
                if(collision(temp,owner.gameAreaColors)) return false;
                else {
                    this.localSpace = temp;
                    return true;
                }
            }
        }
       
        /* check for a collision between the locSp (local space) and gAC (gameAreaColors) */
        protected synchronized boolean collision(boolean[][] locSp, int[][] gAC) {
            for(int y=0;y<locSp.length;y++) {
                for(int x=0;x<locSp[y].length;x++) {
                    if(locSp[y][x])
                        if(y+yloc<0 || x+xloc<0 || y+yloc>gAC.length-1 || x+xloc>gAC[0].length-1 || gAC[y+yloc][x+xloc]!=GAMEAREABGCOLOR)
                            return true;
                }
            }
            return false;
        }
       
        /* try to move the block (relx, rely) relative units
         * relx and rely are in screen coordinates; positive Y is downward
         */
        public synchronized boolean translate(int relx, int rely) {
            //if(xloc+relx<0 || xloc+relx+localSpace[0].length>inst.gameAreaColors[0].length || yloc+rely<0 || yloc+rely+localSpace.length>inst.gameAreaColors.length)
            //    return false;
            if(owner==null) return true;
            for(int y=0;y<localSpace.length;y++) {
                for(int x=0;x<localSpace[y].length;x++) {
                    if(localSpace[y][x])
                        if(y+yloc+rely<0 || y+yloc+rely>owner.gameAreaColors.length-1 || x+xloc+relx<0 || x+xloc+relx>owner.gameAreaColors[0].length-1 || owner.gameAreaColors[y+yloc+rely][x+xloc+relx]!=GAMEAREABGCOLOR)
                            return false;
                }
            }
            xloc+=relx;
            yloc+=rely;
            return true;
        }

        /* draw the block onto gameAreaColors, and then return the result */
        public synchronized int[][] draw(int[][] gameAreaColors) {
            int[][] temp = new int[gameAreaColors.length][gameAreaColors[0].length];
            for(int i=0;i<temp.length;i++)
                temp[i] = (int[])gameAreaColors[i].clone();
           
            for(int y=0;y<localSpace.length;y++) {
                for(int x=0;x<localSpace[y].length;x++) {
                    if(localSpace[y][x])
                        temp[y+yloc][x+xloc] = color;
                }
            }
            return temp;
        }
       
        public Block(Player onr) {
            this.flips = false;
            this.owner = onr;
            this.xloc = 3;
            this.yloc = 0;
        }
       
        public abstract int getType();
    }
    
    /*
     * Each of the seven blocks are created below.
     * They extend the constructor to set up local space and, if necessary, flipped space
     * and also color. The getType() functionality is not currently used.
     */
    
    // [][][][]
    //         
    protected class BlockI extends Block {
        public BlockI(Player onr) {
            super(onr);
            this.flips = true;
            this.localSpace = new boolean[][] {
                    {false,false,false,false},
                    {true,true,true,true},
                    {false,false,false,false},
                    {false,false,false,false}
            };
            this.flippedSpace = new boolean[][] {
                    {false,true,false,false},
                    {false,true,false,false},
                    {false,true,false,false},
                    {false,true,false,false}
            };
            this.color = 0x33FFFF;
        }
       
        public final int getType() { return BLOCK_I; }
    }
    
    // []      
    // [][][]  
    protected class BlockJ extends Block {
        public BlockJ(Player onr) {
            super(onr);
            this.localSpace = new boolean[][] {
                    {true,false,false},
                    {true,true,true},
                    {false,false,false},
            };
            this.color = 0x0000FF;
        }
       
        public final int getType() { return BLOCK_J; }
    }
    
    // [][][]  
    // []      
    protected class BlockL extends Block {
        public BlockL(Player onr) {
            super(onr);
            this.localSpace = new boolean[][] {
                    {false,false,false},
                    {true,true,true},
                    {true,false,false}
            };
            this.color = 0xFF9900;
        }
       
        public final int getType() { return BLOCK_L; }
    }
    
    // [][]    
    // [][]    
    protected class BlockO extends Block {
        public BlockO(Player onr) {
            super(onr);
            this.localSpace = new boolean[][] {
                    {true,true},
                    {true,true}
            };
            this.color = 0xFFFF00;
        }
       
        public final int getType() { return BLOCK_O; }
    }
    
    //   [][]  
    // [][]    
    protected class BlockS extends Block {
        public BlockS(Player onr) {
            super(onr);
            this.flips = true;
            this.localSpace = new boolean[][] {
                    {false,true,true},
                    {true,true,false},
                    {false,false,false}
            };
            this.flippedSpace = new boolean[][] {
                    {false,true,false},
                    {false,true,true},
                    {false,false,true}
            };
            this.color = 0x00FF00;
        }
       
        public final int getType() { return BLOCK_S; }
    }
    
    //   []    
    // [][][]  
    protected class BlockT extends Block {
        public BlockT(Player onr) {
            super(onr);
            this.localSpace = new boolean[][] {
                    {false,true,false},
                    {true,true,true},
                    {false,false,false}
            };
            this.color = 0x9900FF;
        }
       
        public final int getType() { return BLOCK_T; }
    }
    
    // [][]    
    //   [][]  
    protected class BlockZ extends Block {
        public BlockZ(Player onr) {
            super(onr);
            this.flips = true;
            this.localSpace = new boolean[][] {
                    {true,true,false},
                    {false,true,true},
                    {false,false,false},
            };
            this.flippedSpace = new boolean[][] {
                    {false,false,true},
                    {false,true,true},
                    {false,true,false}
            };
            this.color = 0xFF0000;
        }
       
        public final int getType() { return BLOCK_Z; }
    }
}